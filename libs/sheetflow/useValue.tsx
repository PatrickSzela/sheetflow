import { useEffect, useState } from "react";
import { useSheetFlow } from "./SheetFlowProvider";
import { CellAddress, isCellAddress } from "./cellAddress";
import { Value } from "./cellValue";
import { isCellChange, isNamedExpressionChange } from "./change";
import { Events } from "./sheetflow";

export const useValue = (
  addressOrNamedExpressionName: CellAddress | string
): Value | undefined => {
  const sf = useSheetFlow();

  const [value, setValue] = useState<Value>();

  useEffect(() => {
    const isAddress = isCellAddress(addressOrNamedExpressionName);

    const onValuesChanged: Events["valuesChanged"] = (changes) => {
      changes.some((change) => {
        if (isAddress && isCellChange(change)) {
          setValue(sf.getCellValue(addressOrNamedExpressionName));
        } else if (!isAddress && isNamedExpressionChange(change)) {
          setValue(sf.getNamedExpressionValue(addressOrNamedExpressionName));
        }
      });
    };

    setValue(
      isAddress
        ? sf.getCellValue(addressOrNamedExpressionName)
        : sf.getNamedExpressionValue(addressOrNamedExpressionName)
    );

    sf.on("valuesChanged", onValuesChanged);

    return () => {
      sf.off("valuesChanged", onValuesChanged);
    };
  }, [addressOrNamedExpressionName, sf]);

  return value;
};

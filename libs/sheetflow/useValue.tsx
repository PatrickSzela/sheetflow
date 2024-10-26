import { useEffect, useState } from "react";
import { useSheetFlow } from "./SheetFlowProvider";
import { areCellAddressesEqual, isCellAddress } from "./cellAddress";
import { isCellRange } from "./cellRange";
import { Value } from "./cellValue";
import { isCellChange, isNamedExpressionChange } from "./change";
import { Events, Reference } from "./sheetflow";

export const useValue = (reference: Reference): Value | undefined => {
  const sf = useSheetFlow();

  const [value, setValue] = useState<Value>();

  useEffect(() => {
    // TODO: implement cell range
    if (isCellRange(reference))
      throw new Error("Cell range not yet implemented");

    const onValuesChanged: Events["valuesChanged"] = (changes) => {
      for (const change of changes) {
        if (
          isCellAddress(reference) &&
          isCellChange(change) &&
          areCellAddressesEqual(reference, change.address)
        ) {
          setValue(sf.getCellValue(reference));
          return;
        } else if (
          typeof reference === "string" &&
          isNamedExpressionChange(change) &&
          reference === change.name
        ) {
          setValue(sf.getNamedExpressionValue(reference));
          return;
        }
      }
    };

    setValue(
      isCellAddress(reference)
        ? sf.getCellValue(reference)
        : sf.getNamedExpressionValue(reference)
    );

    sf.on("valuesChanged", onValuesChanged);

    return () => {
      sf.off("valuesChanged", onValuesChanged);
    };
  }, [reference, sf]);

  return value;
};

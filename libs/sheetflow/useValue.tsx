import { useEffect, useState } from "react";
import { useSheetFlow } from "./SheetFlowProvider";
import { isCellAddress } from "./cellAddress";
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
      changes.some((change) => {
        if (isCellAddress(reference) && isCellChange(change)) {
          setValue(sf.getCellValue(reference));
        } else if (
          typeof reference === "string" &&
          isNamedExpressionChange(change)
        ) {
          setValue(sf.getNamedExpressionValue(reference));
        }
      });
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

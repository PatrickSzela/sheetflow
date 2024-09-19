import * as SheetFlow from "@/libs/sheetflow";
import { HyperFormula, SerializedNamedExpression } from "hyperformula";

export const remapNamedExpression = (
  hf: HyperFormula,
  namedExpression: SerializedNamedExpression
): SheetFlow.NamedExpression => {
  const { name, expression, scope } = namedExpression;

  return {
    name,
    expression,
    scope: scope !== undefined ? hf.getSheetName(scope) : undefined,
  };
};

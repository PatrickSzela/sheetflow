import * as SheetFlow from "@/libs/sheetflow";
import { HyperFormula, SerializedNamedExpression } from "hyperformula";
import { getSheetIdWithError } from "./utils";

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

export const unmapNamedExpression = (
  hf: HyperFormula,
  namedExpression: SheetFlow.NamedExpression
): SerializedNamedExpression => {
  const { name, expression, scope } = namedExpression;

  return {
    name,
    expression,
    scope: scope !== undefined ? getSheetIdWithError(hf, scope) : undefined,
  };
};

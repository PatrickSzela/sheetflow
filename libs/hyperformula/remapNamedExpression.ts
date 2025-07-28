import {
  type HyperFormula,
  type SerializedNamedExpression,
} from "hyperformula";
import * as SheetFlow from "@/libs/sheetflow";
import { getSheetIdWithError } from "./utils";

export const remapNamedExpression = (
  hf: HyperFormula,
  namedExpression: SerializedNamedExpression,
): SheetFlow.NamedExpression => {
  const { name, expression, scope } = namedExpression;

  const sheetName = scope !== undefined ? hf.getSheetName(scope) : undefined;

  return {
    name,
    expression,
    ...(sheetName !== undefined && { scope: sheetName }),
  };
};

export const unmapNamedExpression = (
  hf: HyperFormula,
  namedExpression: SheetFlow.NamedExpression,
): SerializedNamedExpression => {
  const { name, expression, scope } = namedExpression;

  return {
    name,
    expression,
    ...(scope !== undefined && { scope: getSheetIdWithError(hf, scope) }),
  };
};

import { type SerializedNamedExpression } from "hyperformula";
import * as SheetFlow from "@/libs/sheetflow";

export const remapNamedExpression = (
  namedExpression: SerializedNamedExpression,
): SheetFlow.NamedExpression => {
  return namedExpression;
};

export const unmapNamedExpression = (
  namedExpression: SheetFlow.NamedExpression,
): SerializedNamedExpression => {
  return namedExpression;
};

import { CellAddress } from "../cellAddress";
import { isCellRange } from "../cellRange";
import {
  AstNodeSubtype,
  AstNodeType,
  buildAst,
  BuildFn,
  isAst,
  RangeReferenceAst,
} from "./ast";

export interface CellRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.CELL_RANGE, CellAddress> {}

export const buildCellRangeReferenceAst: BuildFn<CellRangeReferenceAst> = (
  args
) =>
  buildAst({
    type: AstNodeType.REFERENCE,
    subtype: AstNodeSubtype.CELL_RANGE,
    ...args,
  });

export const isCellRangeReferenceAst = (
  ast: unknown
): ast is CellRangeReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, start, end, sheet } =
    ast as Partial<CellRangeReferenceAst>;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.CELL_RANGE &&
    isCellRange({ start, end }) &&
    typeof sheet === "string" &&
    sheet.length > 0
  );
};

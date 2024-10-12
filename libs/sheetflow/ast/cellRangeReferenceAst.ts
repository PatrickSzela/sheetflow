import { CellAddress } from "../cellAddress";
import { isCellRange } from "../cellRange";
import {
  AstNodeSubtype,
  AstNodeType,
  BuildFn,
  isAst,
  RangeReferenceAst,
} from "./ast";

export interface CellRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.CELL_RANGE, CellAddress> {}

export const buildCellRangeReferenceAst: BuildFn<CellRangeReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.CELL_RANGE,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isCellRangeReferenceAst = (
  ast: any
): ast is CellRangeReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, start, end, sheet } = ast as CellRangeReferenceAst;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.CELL_RANGE &&
    isCellRange({ start, end }) &&
    typeof sheet === "string" &&
    sheet.length > 0
  );
};

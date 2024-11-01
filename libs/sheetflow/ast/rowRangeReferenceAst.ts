import {
  AstNodeSubtype,
  AstNodeType,
  buildAst,
  BuildFn,
  isAst,
  RangeReferenceAst,
} from "./ast";

export interface RowRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.ROW_RANGE, number> {}

export const buildRowRangeReferenceAst: BuildFn<RowRangeReferenceAst> = (
  args
) =>
  buildAst({
    type: AstNodeType.REFERENCE,
    subtype: AstNodeSubtype.ROW_RANGE,
    ...args,
  });

export const isRowRangeReferenceAst = (
  ast: any
): ast is RowRangeReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, start, end, sheet } =
    ast as Partial<RowRangeReferenceAst>;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.ROW_RANGE &&
    // TODO: move to isRowRange
    typeof start === "number" &&
    start >= 0 &&
    typeof end === "number" &&
    end >= 0 &&
    typeof sheet === "string" &&
    sheet.length > 0
  );
};

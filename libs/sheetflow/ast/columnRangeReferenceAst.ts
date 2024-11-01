import {
  AstNodeSubtype,
  AstNodeType,
  buildAst,
  BuildFn,
  isAst,
  RangeReferenceAst,
} from "./ast";

export interface ColumnRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.COLUMN_RANGE, number> {}

export const buildColumnRangeReferenceAst: BuildFn<ColumnRangeReferenceAst> = (
  args
) =>
  buildAst({
    type: AstNodeType.REFERENCE,
    subtype: AstNodeSubtype.COLUMN_RANGE,
    ...args,
  });

export const isColumnRangeReferenceAst = (
  ast: any
): ast is ColumnRangeReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, start, end, sheet } =
    ast as Partial<ColumnRangeReferenceAst>;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.COLUMN_RANGE &&
    // TODO: move to isColumnRange
    typeof start === "number" &&
    start >= 0 &&
    typeof end === "number" &&
    end >= 0 &&
    typeof sheet === "string" &&
    sheet.length > 0
  );
};

import {
  AstNodeSubtype,
  AstNodeType,
  BuildFn,
  isAst,
  RangeReferenceAst,
} from "./ast";

export interface ColumnRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.COLUMN_RANGE, number> {}

export const buildColumnRangeReferenceAst: BuildFn<ColumnRangeReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.COLUMN_RANGE,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isColumnRangeReferenceAst = (
  ast: any
): ast is ColumnRangeReferenceAst => {
  const { type, subtype, start, end, sheet } = ast as ColumnRangeReferenceAst;

  return (
    isAst(ast) &&
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

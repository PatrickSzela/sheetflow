import {
  AstNodeSubtype,
  AstNodeType,
  BuildFn,
  isAst,
  RangeReferenceAst,
} from "./ast";

export interface RowRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.ROW_RANGE, number> {}

export const buildRowRangeReferenceAst: BuildFn<RowRangeReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.ROW_RANGE,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isRowRangeReferenceAst = (
  ast: any
): ast is RowRangeReferenceAst => {
  const { type, subtype, start, end, sheet } = ast as RowRangeReferenceAst;

  return (
    isAst(ast) &&
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

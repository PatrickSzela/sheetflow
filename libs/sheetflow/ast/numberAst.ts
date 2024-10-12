import {
  AstNodeSubtype,
  AstNodeType,
  AstWithValue,
  BuildFn,
  isAst,
  isAstWithValue,
} from "./ast";

export interface NumberAst
  extends AstWithValue<AstNodeSubtype.NUMBER, number> {}

export const buildNumberAst: BuildFn<NumberAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.NUMBER,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isNumberAst = (ast: any): ast is NumberAst => {
  if (!isAst(ast)) return false;

  const { subtype, value } = ast as NumberAst;

  return (
    isAstWithValue(ast) &&
    subtype === AstNodeSubtype.NUMBER &&
    typeof value === "number"
  );
};

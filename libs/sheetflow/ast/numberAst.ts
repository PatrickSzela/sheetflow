import {
  AstNodeSubtype,
  AstNodeType,
  buildAst,
  isAstWithValue,
  type AstWithValue,
  type BuildFn,
} from "./ast";

export interface NumberAst
  extends AstWithValue<AstNodeSubtype.NUMBER, number> {}

export const buildNumberAst: BuildFn<NumberAst> = (args) =>
  buildAst({
    type: AstNodeType.VALUE,
    subtype: AstNodeSubtype.NUMBER,
    ...args,
  });

export const isNumberAst = (ast: unknown): ast is NumberAst => {
  if (!isAstWithValue(ast)) return false;

  const { subtype, value } = ast as Partial<NumberAst>;

  return subtype === AstNodeSubtype.NUMBER && typeof value === "number";
};

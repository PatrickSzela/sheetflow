import {
  AstNodeSubtype,
  AstNodeType,
  AstWithValue,
  buildAst,
  BuildFn,
  isAstWithValue,
} from "./ast";

export interface StringAst
  extends AstWithValue<AstNodeSubtype.STRING, string> {}

export const buildStringAst: BuildFn<StringAst> = (args) =>
  buildAst({
    type: AstNodeType.VALUE,
    subtype: AstNodeSubtype.STRING,
    ...args,
  });

export const isStringAst = (ast: any): ast is StringAst => {
  if (!isAstWithValue(ast)) return false;

  const { subtype, value } = ast as Partial<StringAst>;

  return subtype === AstNodeSubtype.STRING && typeof value === "string";
};

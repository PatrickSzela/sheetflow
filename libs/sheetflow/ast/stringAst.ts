import {
  AstNodeSubtype,
  AstNodeType,
  AstWithValue,
  BuildFn,
  isAstWithValue,
} from "./ast";

export interface StringAst
  extends AstWithValue<AstNodeSubtype.STRING, string> {}

export const buildStringAst: BuildFn<StringAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.STRING,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isStringAst = (ast: any): ast is StringAst => {
  const { subtype, value } = ast as StringAst;

  return (
    isAstWithValue(ast) &&
    subtype === AstNodeSubtype.STRING &&
    typeof value === "string"
  );
};

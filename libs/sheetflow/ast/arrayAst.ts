import {
  Ast,
  AstNodeSubtype,
  AstNodeType,
  AstWithValue,
  BuildFn,
  isAst,
  isAstWithValue,
} from "./ast";

export interface ArrayAst extends AstWithValue<AstNodeSubtype.ARRAY, Ast[][]> {}

export const buildArrayAst: BuildFn<ArrayAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.ARRAY,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isArrayAst = (ast: any): ast is ArrayAst => {
  if (!isAst(ast)) return false;

  const { subtype, value } = ast as ArrayAst;

  return (
    isAstWithValue(ast) &&
    subtype === AstNodeSubtype.ARRAY &&
    Array.isArray(value) &&
    value.every((arr) => Array.isArray(arr) && arr.map((ast) => isAst(ast)))
  );
};

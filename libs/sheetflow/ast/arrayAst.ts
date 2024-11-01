import {
  Ast,
  AstNodeSubtype,
  AstNodeType,
  AstWithValue,
  buildAst,
  BuildFn,
  isAst,
  isAstWithValue,
} from "./ast";

export interface ArrayAst extends AstWithValue<AstNodeSubtype.ARRAY, Ast[][]> {}

export const buildArrayAst: BuildFn<ArrayAst> = (args) =>
  buildAst({
    type: AstNodeType.VALUE,
    subtype: AstNodeSubtype.ARRAY,
    ...args,
  });

export const isArrayAst = (ast: any): ast is ArrayAst => {
  if (!isAstWithValue(ast)) return false;

  const { subtype, value } = ast as Partial<ArrayAst>;

  return (
    subtype === AstNodeSubtype.ARRAY &&
    Array.isArray(value) &&
    value.every((arr) => Array.isArray(arr) && arr.map((ast) => isAst(ast)))
  );
};

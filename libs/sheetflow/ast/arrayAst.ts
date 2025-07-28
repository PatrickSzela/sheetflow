import {
  AstNodeSubtype,
  AstNodeType,
  buildAst,
  isAst,
  isAstWithValue,
  type Ast,
  type AstWithValue,
  type BuildFn,
} from "./ast";

export interface ArrayAst extends AstWithValue<AstNodeSubtype.ARRAY, Ast[][]> {}

export const buildArrayAst: BuildFn<ArrayAst> = (args) =>
  buildAst({
    type: AstNodeType.VALUE,
    subtype: AstNodeSubtype.ARRAY,
    ...args,
  });

export const isArrayAst = (ast: unknown): ast is ArrayAst => {
  if (!isAstWithValue(ast)) return false;

  const { subtype, value } = ast as Partial<ArrayAst>;

  return (
    subtype === AstNodeSubtype.ARRAY &&
    Array.isArray(value) &&
    value.every((arr) => Array.isArray(arr) && arr.map((ast) => isAst(ast)))
  );
};

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

// array constants (e.g. `{1,2,3;4,5,6}`) can be up to 2 dimensions
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

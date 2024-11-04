import {
  AstNodeSubtype,
  AstNodeType,
  AstWithValue,
  buildAst,
  BuildFn,
  isAstWithValue,
} from "./ast";

export interface EmptyAst extends AstWithValue<AstNodeSubtype.EMPTY, null> {}

export const buildEmptyAst: BuildFn<EmptyAst> = (args) =>
  buildAst({ type: AstNodeType.VALUE, subtype: AstNodeSubtype.EMPTY, ...args });

export const isEmptyAst = (ast: unknown): ast is EmptyAst => {
  if (!isAstWithValue(ast)) return false;

  const { subtype, value } = ast as Partial<EmptyAst>;

  return subtype === AstNodeSubtype.EMPTY && value === null;
};

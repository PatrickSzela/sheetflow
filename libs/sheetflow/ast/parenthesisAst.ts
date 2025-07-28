import {
  AstNodeType,
  buildAst,
  isAstWithChildren,
  type Ast,
  type AstWithChildren,
  type BuildFn,
} from "./ast";

export interface ParenthesisAst
  extends AstWithChildren<AstNodeType.PARENTHESIS, [Ast]> {}

export const buildParenthesisAst: BuildFn<ParenthesisAst> = (args) =>
  buildAst({
    type: AstNodeType.PARENTHESIS,
    ...args,
  });

export const isParenthesisAst = (ast: unknown): ast is ParenthesisAst => {
  if (!isAstWithChildren(ast)) return false;

  const { type, children } = ast as Partial<ParenthesisAst>;

  return type === AstNodeType.PARENTHESIS && children?.length === 1;
};

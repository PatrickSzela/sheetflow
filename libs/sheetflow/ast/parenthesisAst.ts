import {
  Ast,
  AstNodeType,
  AstWithChildren,
  BuildFn,
  isAstWithChildren,
} from "./ast";

export interface ParenthesisAst
  extends AstWithChildren<AstNodeType.PARENTHESIS, [Ast]> {}

export const buildParenthesisAst: BuildFn<ParenthesisAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.PARENTHESIS,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isParenthesisAst = (ast: any): ast is ParenthesisAst => {
  const { type, children } = ast as ParenthesisAst;

  return (
    isAstWithChildren(ast) &&
    type === AstNodeType.PARENTHESIS &&
    children.length === 1
  );
};

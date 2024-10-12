import {
  Ast,
  AstNodeType,
  AstWithChildren,
  BuildFn,
  isAst,
  isAstWithChildren,
  Operators,
} from "./ast";

export interface BinaryExpressionAst
  extends AstWithChildren<AstNodeType.BINARY_EXPRESSION, [Ast, Ast]> {
  operator: string;
}

export const buildBinaryExpressionAst: BuildFn<BinaryExpressionAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.BINARY_EXPRESSION,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isBinaryExpressionAst = (ast: any): ast is BinaryExpressionAst => {
  if (!isAst(ast)) return false;

  const { type, operator, children } = ast as BinaryExpressionAst;

  return (
    isAstWithChildren(ast) &&
    type === AstNodeType.BINARY_EXPRESSION &&
    operator in Operators &&
    children.length === 2
  );
};

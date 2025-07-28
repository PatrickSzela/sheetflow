import {
  AstNodeType,
  Operators,
  buildAst,
  isAstWithChildren,
  type Ast,
  type AstWithChildren,
  type BuildFn,
} from "./ast";

export interface BinaryExpressionAst
  extends AstWithChildren<AstNodeType.BINARY_EXPRESSION, [Ast, Ast]> {
  operator: string;
}

export const buildBinaryExpressionAst: BuildFn<BinaryExpressionAst> = (args) =>
  buildAst({
    type: AstNodeType.BINARY_EXPRESSION,
    ...args,
  });

export const isBinaryExpressionAst = (
  ast: unknown,
): ast is BinaryExpressionAst => {
  if (!isAstWithChildren(ast)) return false;

  const { type, operator, children } = ast as Partial<BinaryExpressionAst>;

  return (
    type === AstNodeType.BINARY_EXPRESSION &&
    operator !== undefined &&
    operator in Operators &&
    children?.length === 2
  );
};

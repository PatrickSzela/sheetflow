import {
  AstNodeType,
  Operators,
  buildAst,
  isAstWithChildren,
  type Ast,
  type AstWithChildren,
  type BuildFn,
} from "./ast";

export interface UnaryExpressionAst
  extends AstWithChildren<AstNodeType.UNARY_EXPRESSION, [Ast]> {
  operator: string;
  operatorOnRight: boolean;
}

export const buildUnaryExpressionAst: BuildFn<UnaryExpressionAst> = (args) =>
  buildAst({
    type: AstNodeType.UNARY_EXPRESSION,
    ...args,
  });

export const isUnaryExpressionAst = (
  ast: unknown,
): ast is UnaryExpressionAst => {
  if (!isAstWithChildren(ast)) return false;

  const { type, operator, operatorOnRight, children } =
    ast as Partial<UnaryExpressionAst>;

  return (
    type === AstNodeType.UNARY_EXPRESSION &&
    operator !== undefined &&
    operator in Operators &&
    typeof operatorOnRight === "boolean" &&
    children?.length === 1
  );
};

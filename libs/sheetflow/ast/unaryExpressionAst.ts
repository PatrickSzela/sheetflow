import {
  Ast,
  AstNodeType,
  AstWithChildren,
  BuildFn,
  isAstWithChildren,
  Operators,
} from "./ast";

export interface UnaryExpressionAst
  extends AstWithChildren<AstNodeType.UNARY_EXPRESSION, [Ast]> {
  operator: string;
  operatorOnRight: boolean;
}

export const buildUnaryExpressionAst: BuildFn<UnaryExpressionAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.UNARY_EXPRESSION,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isUnaryExpressionAst = (ast: any): ast is UnaryExpressionAst => {
  const { type, operator, operatorOnRight, children } =
    ast as UnaryExpressionAst;

  return (
    isAstWithChildren(ast) &&
    type === AstNodeType.UNARY_EXPRESSION &&
    operator in Operators &&
    typeof operatorOnRight === "boolean" &&
    children.length === 1
  );
};

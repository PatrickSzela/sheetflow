import {
  AstNodeSubtype,
  AstNodeType,
  AstWithSubtype,
  BuildFn,
  isAst,
} from "./ast";

export interface NamedExpressionReferenceAst
  extends AstWithSubtype<
    AstNodeType.REFERENCE,
    AstNodeSubtype.NAMED_EXPRESSION
  > {
  expressionName: string;
}

export const buildNamedExpressionReferenceAst: BuildFn<
  NamedExpressionReferenceAst
> = ({ id, ...args }) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.NAMED_EXPRESSION,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isNamedExpressionReferenceAst = (
  ast: any
): ast is NamedExpressionReferenceAst => {
  const { type, subtype, expressionName } = ast as NamedExpressionReferenceAst;

  return (
    isAst(ast) &&
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.NAMED_EXPRESSION &&
    typeof expressionName === "string" &&
    expressionName.length > 0
  );
};

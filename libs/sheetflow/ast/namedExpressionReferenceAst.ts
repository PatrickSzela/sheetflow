import {
  AstNodeSubtype,
  AstNodeType,
  AstWithSubtype,
  buildAst,
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
> = (args) =>
  buildAst({
    type: AstNodeType.REFERENCE,
    subtype: AstNodeSubtype.NAMED_EXPRESSION,
    ...args,
  });

export const isNamedExpressionReferenceAst = (
  ast: unknown
): ast is NamedExpressionReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, expressionName } =
    ast as Partial<NamedExpressionReferenceAst>;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.NAMED_EXPRESSION &&
    typeof expressionName === "string" &&
    expressionName.length > 0
  );
};

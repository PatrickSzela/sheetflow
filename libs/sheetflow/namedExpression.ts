import { type CellContent } from "./cell";

export type NamedExpressionReference = {
  name: string;
  scope?: number;
};

export type NamedExpression = NamedExpressionReference & {
  expression: CellContent;
};

export type NamedExpressions = NamedExpression[];

export const isNamedExpressionReference = (
  namedExpressionReference: unknown,
): namedExpressionReference is NamedExpressionReference => {
  const { name, scope } = namedExpressionReference as NamedExpressionReference;

  return (
    typeof name === "string" &&
    (typeof scope === "number" || scope === undefined)
  );
};

export const isNamedExpression = (
  namedExpression: unknown,
): namedExpression is NamedExpression => {
  const { expression } = namedExpression as NamedExpression;
  return (
    typeof expression === "string" &&
    isNamedExpressionReference(namedExpression)
  );
};

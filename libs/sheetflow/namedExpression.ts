import { type CellContent } from "./cell";

export type NamedExpression = {
  name: string;
  expression: CellContent;
  scope?: number;
};

export type NamedExpressions = NamedExpression[];

export const isNamedExpression = (
  namedExpression: unknown,
): namedExpression is NamedExpression => {
  const { expression, name, scope } = namedExpression as NamedExpression;

  return (
    typeof expression === "string" &&
    typeof name === "string" &&
    (typeof scope === "number" || scope === undefined)
  );
};

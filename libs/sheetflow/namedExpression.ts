import { CellContent } from "./cell";

export type NamedExpression = {
  name: string;
  expression: CellContent;
  scope?: string;
};

export type NamedExpressions = NamedExpression[];

export const isNamedExpression = (
  namedExpression: any
): namedExpression is NamedExpression => {
  const { expression, name, scope } = namedExpression as NamedExpression;

  return (
    typeof expression === "string" &&
    typeof name === "string" &&
    (typeof scope === "string" || scope === undefined)
  );
};

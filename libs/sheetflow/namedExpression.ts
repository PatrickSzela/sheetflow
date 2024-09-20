import { CellContent } from "./cell";

export type NamedExpression = {
  name: string;
  expression: CellContent;
  scope?: string;
};

export type NamedExpressions = NamedExpression[];

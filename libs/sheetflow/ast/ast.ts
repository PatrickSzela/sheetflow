import { type ArrayAst } from "./arrayAst";
import { type BinaryExpressionAst } from "./binaryExpressionAst";
import { type CellRangeReferenceAst } from "./cellRangeReferenceAst";
import { type CellReferenceAst } from "./cellReferenceAst";
import { type ColumnRangeReferenceAst } from "./columnRangeReferenceAst";
import { type EmptyAst } from "./emptyAst";
import { type ErrorAst } from "./errorAst";
import { type FunctionAst } from "./functionAst";
import { type NamedExpressionReferenceAst } from "./namedExpressionReferenceAst";
import { type NumberAst } from "./numberAst";
import { type ParenthesisAst } from "./parenthesisAst";
import { type RowRangeReferenceAst } from "./rowRangeReferenceAst";
import { type StringAst } from "./stringAst";
import { type UnaryExpressionAst } from "./unaryExpressionAst";

export type Ast =
  | EmptyAst
  | NumberAst
  | StringAst
  | ArrayAst
  | CellReferenceAst
  | CellRangeReferenceAst
  | ColumnRangeReferenceAst
  | RowRangeReferenceAst
  | NamedExpressionReferenceAst
  | FunctionAst
  | UnaryExpressionAst
  | BinaryExpressionAst
  | ParenthesisAst
  | ErrorAst;

export enum AstNodeType {
  VALUE = "VALUE",
  REFERENCE = "REFERENCE",
  FUNCTION = "FUNCTION",
  UNARY_EXPRESSION = "UNARY_EXPRESSION",
  BINARY_EXPRESSION = "BINARY_EXPRESSION",
  PARENTHESIS = "PARENTHESIS",
  ERROR = "ERROR",
}

export enum AstNodeSubtype {
  // value
  EMPTY = "EMPTY",
  NUMBER = "NUMBER",
  STRING = "STRING",
  ARRAY = "ARRAY",

  // reference
  CELL = "CELL",
  NAMED_EXPRESSION = "NAMED_EXPRESSION",
  CELL_RANGE = "RANGE",
  COLUMN_RANGE = "COLUMN_RANGE",
  ROW_RANGE = "ROW_RANGE",
}

export enum Operators {
  "-" = "-",
  "+" = "+",
  "%" = "%",
  "&" = "&",
  "=" = "=",
  "<>" = "<>",
  ">" = ">",
  "<" = "<",
  ">=" = ">=",
  "<=" = "<=",
  "*" = "*",
  "/" = "/",
  "^" = "^",
}

export type Operator = `${Operators}`;

export type BuildAstFnArgs<T extends AstBase> = Omit<
  T,
  "type" | "subtype" | "id"
> &
  Partial<Pick<T, "id">>;

export type BuildFn<T extends AstBase> = (args: BuildAstFnArgs<T>) => T;

export interface AstBase<TType extends AstNodeType = AstNodeType> {
  type: TType;
  id: string;
  rawContent: string;
  isArrayFormula?: boolean;
}

type BuildBaseAstFnArgs<T extends AstBase> = Omit<T, "id"> &
  Partial<Pick<T, "id">>;

export const buildAst = <
  T extends AstBase,
  TArgs extends BuildBaseAstFnArgs<T>,
>({
  id,
  ...args
}: TArgs) =>
  ({
    id: id ?? crypto.randomUUID(),
    ...args,
  }) as unknown as T;

export const isAst = (ast: unknown): ast is AstBase => {
  if (typeof ast !== "object") return false;

  const { type, id, rawContent, isArrayFormula } = ast as Partial<AstBase>;

  return (
    type !== undefined &&
    type in AstNodeType &&
    typeof id === "string" &&
    typeof rawContent === "string" &&
    (typeof isArrayFormula === "boolean" || isArrayFormula === undefined)
  );
};

export interface AstWithSubtype<
  TType extends AstNodeType,
  TSubtype extends AstNodeSubtype,
> extends AstBase<TType> {
  subtype: TSubtype;
}

export interface AstWithChildren<
  TType extends AstNodeType,
  TChild extends Ast[],
> extends AstBase<TType> {
  children: TChild;
  requirements: {
    minChildCount: number;
    maxChildCount: number;
  };
}
export const isAstWithChildren = (
  ast: unknown,
): ast is AstWithChildren<AstNodeType, Ast[]> => {
  if (!isAst(ast)) return false;

  const { children, requirements } = ast as Partial<
    AstWithChildren<AstNodeType, Ast[]>
  >;

  return (
    Array.isArray(children) &&
    typeof requirements === "object" &&
    typeof requirements.minChildCount === "number" &&
    requirements.minChildCount >= 0 &&
    typeof requirements.maxChildCount === "number" &&
    requirements.maxChildCount >= 0
  );
};

export interface AstWithValue<TSubtype extends AstNodeSubtype, TValue>
  extends AstWithSubtype<AstNodeType.VALUE, TSubtype> {
  value: TValue;
}

export const isAstWithValue = (
  ast: unknown,
): ast is AstWithValue<AstNodeSubtype, unknown> => {
  if (!isAst(ast)) return false;

  const { type, subtype } = ast as Partial<
    AstWithValue<AstNodeSubtype, unknown>
  >;

  return (
    type === AstNodeType.VALUE &&
    subtype !== undefined &&
    subtype in AstNodeSubtype &&
    "value" in ast
  );
};

export interface RangeReferenceAst<TSubtype extends AstNodeSubtype, TStartEnd>
  extends AstWithSubtype<AstNodeType.REFERENCE, TSubtype> {
  start: TStartEnd;
  end: TStartEnd;
  sheet: string;
}

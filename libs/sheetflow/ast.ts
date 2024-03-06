import { CellAddress } from "./cellAddress";

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

type BuildArgs<T> = Omit<T, "type" | "subtype">;
type BuildFn<T> = (args: BuildArgs<T>) => T;

export interface Ast<TType extends AstNodeType = AstNodeType> {
  type: TType;
  rawContent: string | null;
}

export interface SubtypeAst<
  TType extends AstNodeType,
  TSubtype extends AstNodeSubtype,
> extends Ast<TType> {
  subtype: TSubtype;
}

// value ASTs
export interface ValueAst<TSubtype extends AstNodeSubtype, TValue>
  extends SubtypeAst<AstNodeType.VALUE, TSubtype> {
  value: TValue;
}

export interface EmptyAst extends ValueAst<AstNodeSubtype.EMPTY, null> {}
export const buildEmptyAst = (): EmptyAst => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.EMPTY,
  rawContent: "",
  value: null,
});

export interface NumberAst extends ValueAst<AstNodeSubtype.NUMBER, Number> {}
export const buildNumberAst: BuildFn<NumberAst> = (args) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.NUMBER,
  ...args,
});

export interface StringAst extends ValueAst<AstNodeSubtype.STRING, string> {}
export const buildStringAst: BuildFn<StringAst> = (args) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.STRING,
  ...args,
});

export interface ArrayAst extends ValueAst<AstNodeSubtype.ARRAY, Ast[][]> {}
export const buildArrayAst: BuildFn<ArrayAst> = (args) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.ARRAY,
  ...args,
});

// reference ASTs
export interface CellReferenceAst
  extends SubtypeAst<AstNodeType.REFERENCE, AstNodeSubtype.CELL> {
  reference: CellAddress;
}
export const buildCellReferenceAst: BuildFn<CellReferenceAst> = (args) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.CELL,
  ...args,
});

export interface RangeReferenceAst<TSubtype extends AstNodeSubtype, TStartEnd>
  extends SubtypeAst<AstNodeType.REFERENCE, TSubtype> {
  start: TStartEnd;
  end: TStartEnd;
}

export interface CellRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.CELL_RANGE, CellAddress> {}
export const buildCellRangeReferenceAst: BuildFn<CellRangeReferenceAst> = (
  args
) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.CELL_RANGE,
  ...args,
});

export interface ColumnRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.COLUMN_RANGE, number> {}
export const buildColumnRangeReferenceAst: BuildFn<ColumnRangeReferenceAst> = (
  args
) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.COLUMN_RANGE,
  ...args,
});

export interface RowRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.ROW_RANGE, number> {}
export const buildRowRangeReferenceAst: BuildFn<RowRangeReferenceAst> = (
  args
) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.ROW_RANGE,
  ...args,
});

export interface NamedExpressionReferenceAst
  extends SubtypeAst<AstNodeType.REFERENCE, AstNodeSubtype.NAMED_EXPRESSION> {
  expressionName: string;
}
export const buildNamedExpressionReferenceAst: BuildFn<
  NamedExpressionReferenceAst
> = (args) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.NAMED_EXPRESSION,
  ...args,
});

// function ASTs
export interface FunctionAst extends Ast<AstNodeType.FUNCTION> {
  functionName: string;
  args: Ast[];
}
export const buildFunctionAst: BuildFn<FunctionAst> = (args) => ({
  type: AstNodeType.FUNCTION,
  ...args,
});

export interface UnaryExpressionAst extends Ast<AstNodeType.UNARY_EXPRESSION> {
  operator: string;
  value: Ast;
}
export const buildUnaryExpressionAst: BuildFn<UnaryExpressionAst> = (args) => ({
  type: AstNodeType.UNARY_EXPRESSION,
  ...args,
});

export interface BinaryExpressionAst
  extends Ast<AstNodeType.BINARY_EXPRESSION> {
  operator: string;
  left: Ast;
  right: Ast;
}
export const buildBinaryExpressionAst: BuildFn<BinaryExpressionAst> = (
  args
) => ({
  type: AstNodeType.BINARY_EXPRESSION,
  ...args,
});

export interface ParenthesisAst extends Ast<AstNodeType.PARENTHESIS> {
  content: Ast;
}
export const buildParenthesisAst: BuildFn<ParenthesisAst> = (args) => ({
  type: AstNodeType.PARENTHESIS,
  ...args,
});

export interface ErrorAst extends Ast<AstNodeType.ERROR> {
  error: string;
}
export const buildErrorAst: BuildFn<ErrorAst> = (args) => ({
  type: AstNodeType.ERROR,
  ...args,
});

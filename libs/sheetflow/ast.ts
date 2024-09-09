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

type BuildArgs<T extends AstBase> = Omit<T, "type" | "subtype" | "id"> & {
  id?: T["id"];
};
type BuildFn<T extends AstBase> = (args: BuildArgs<T>) => T;

export interface AstBase<TType extends AstNodeType = AstNodeType> {
  type: TType;
  id: string;
  rawContent: string;
}

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

export interface AstWithValue<TSubtype extends AstNodeSubtype, TValue>
  extends AstWithSubtype<AstNodeType.VALUE, TSubtype> {
  value: TValue;
}

// value ASTs
export interface EmptyAst extends AstWithValue<AstNodeSubtype.EMPTY, null> {}
export const buildEmptyAst: BuildFn<EmptyAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.EMPTY,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface NumberAst
  extends AstWithValue<AstNodeSubtype.NUMBER, Number> {}
export const buildNumberAst: BuildFn<NumberAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.NUMBER,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface StringAst
  extends AstWithValue<AstNodeSubtype.STRING, string> {}
export const buildStringAst: BuildFn<StringAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.STRING,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface ArrayAst extends AstWithValue<AstNodeSubtype.ARRAY, Ast[][]> {}
export const buildArrayAst: BuildFn<ArrayAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.ARRAY,
  id: id ?? crypto.randomUUID(),
  ...args,
});

// reference ASTs
export interface CellReferenceAst
  extends AstWithSubtype<AstNodeType.REFERENCE, AstNodeSubtype.CELL> {
  reference: CellAddress;
}
export const buildCellReferenceAst: BuildFn<CellReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.CELL,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface RangeReferenceAst<TSubtype extends AstNodeSubtype, TStartEnd>
  extends AstWithSubtype<AstNodeType.REFERENCE, TSubtype> {
  start: TStartEnd;
  end: TStartEnd;
  sheet: string;
}

export interface CellRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.CELL_RANGE, CellAddress> {}
export const buildCellRangeReferenceAst: BuildFn<CellRangeReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.CELL_RANGE,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface ColumnRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.COLUMN_RANGE, number> {}
export const buildColumnRangeReferenceAst: BuildFn<ColumnRangeReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.COLUMN_RANGE,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface RowRangeReferenceAst
  extends RangeReferenceAst<AstNodeSubtype.ROW_RANGE, number> {}
export const buildRowRangeReferenceAst: BuildFn<RowRangeReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.ROW_RANGE,
  id: id ?? crypto.randomUUID(),
  ...args,
});

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

// function ASTs
export interface FunctionAst
  extends AstWithChildren<AstNodeType.FUNCTION, Ast[]> {
  functionName: string;
}
export const buildFunctionAst: BuildFn<FunctionAst> = ({ id, ...args }) => ({
  type: AstNodeType.FUNCTION,
  id: id ?? crypto.randomUUID(),
  ...args,
});

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

export interface BinaryExpressionAst
  extends AstWithChildren<AstNodeType.BINARY_EXPRESSION, [Ast, Ast]> {
  operator: string;
}
export const buildBinaryExpressionAst: BuildFn<BinaryExpressionAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.BINARY_EXPRESSION,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface ParenthesisAst
  extends AstWithChildren<AstNodeType.PARENTHESIS, [Ast]> {}
export const buildParenthesisAst: BuildFn<ParenthesisAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.PARENTHESIS,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export interface ErrorAst extends AstBase<AstNodeType.ERROR> {
  error: string;
}
export const buildErrorAst: BuildFn<ErrorAst> = ({ id, ...args }) => ({
  type: AstNodeType.ERROR,
  id: id ?? crypto.randomUUID(),
  ...args,
});

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

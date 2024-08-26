export enum CellValueType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  EMPTY = "EMPTY",
  BOOLEAN = "BOOLEAN",
  ERROR = "ERROR",
}

export enum CellValueSubtype {
  NUMBER_RAW = "NUMBER_RAW",
  NUMBER_PERCENT = "NUMBER_PERCENT",
  NUMBER_CURRENCY = "NUMBER_CURRENCY",
  NUMBER_DATE = "NUMBER_DATE",
  NUMBER_TIME = "NUMBER_TIME",
  NUMBER_DATETIME = "NUMBER_DATETIME",
}

type BuildArgs<T> = Omit<T, "type">;
type BuildFn<T> = (args: BuildArgs<T>) => T;

export interface CellValueBase<TValue, TType> {
  value: TValue;
  type: TType;
}

export interface NumberCellValue
  extends CellValueBase<number, CellValueType.NUMBER> {
  subtype: CellValueSubtype;
}
export const buildNumberCellValue: BuildFn<NumberCellValue> = (args) => ({
  type: CellValueType.NUMBER,
  ...args,
});

export interface StringCellValue
  extends CellValueBase<string, CellValueType.STRING> {}
export const buildStringCellValue: BuildFn<StringCellValue> = (args) => ({
  type: CellValueType.STRING,
  ...args,
});

export interface EmptyCellValue
  extends CellValueBase<null, CellValueType.EMPTY> {}
export const buildEmptyCellValue: BuildFn<EmptyCellValue> = (args) => ({
  type: CellValueType.EMPTY,
  ...args,
});

export interface BooleanCellValue
  extends CellValueBase<boolean, CellValueType.BOOLEAN> {}
export const buildBooleanCellValue: BuildFn<BooleanCellValue> = (args) => ({
  type: CellValueType.BOOLEAN,
  ...args,
});

export interface ErrorCellValue
  extends CellValueBase<string, CellValueType.ERROR> {
  subtype: string;
  message: string;
}
export const buildErrorCellValue: BuildFn<ErrorCellValue> = (args) => ({
  type: CellValueType.ERROR,
  ...args,
});

export type CellValue =
  | NumberCellValue
  | StringCellValue
  | EmptyCellValue
  | BooleanCellValue
  | ErrorCellValue;

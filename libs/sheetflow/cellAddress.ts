export interface CellAddress {
  column: number;
  row: number;
  sheet: string;
}

export interface CellRange {
  start: CellAddress;
  end: CellAddress;
}

export const buildCellAddress = (
  column: number,
  row: number,
  sheet: string
): CellAddress => ({
  column,
  row,
  sheet,
});

export const buildCellRange = (
  start: CellAddress,
  end: CellAddress
): CellRange => ({
  start,
  end,
});

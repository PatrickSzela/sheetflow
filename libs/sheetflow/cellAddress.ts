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

export const areAddressesEqual = (
  address1: CellAddress,
  address2: CellAddress
) => {
  return (
    address1.column === address2.column &&
    address1.row === address2.row &&
    address1.sheet === address2.sheet
  );
};

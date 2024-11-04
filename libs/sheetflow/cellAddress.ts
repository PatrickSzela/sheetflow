export interface CellAddress {
  column: number;
  row: number;
  sheet: string;
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

export const isCellAddress = (address: unknown): address is CellAddress => {
  const { column, row, sheet } = (address ?? {}) as CellAddress;

  return (
    typeof column === "number" &&
    column >= 0 &&
    typeof row === "number" &&
    row >= 0 &&
    typeof sheet === "string" &&
    sheet.length > 0
  );
};

export const areCellAddressesEqual = (
  address1: CellAddress,
  address2: CellAddress
): boolean => {
  return (
    address1.column === address2.column &&
    address1.row === address2.row &&
    address1.sheet === address2.sheet
  );
};

export const extractDataFromStringAddress = (
  address: string
): { position: string; sheet: string } => {
  const [position, sheet] = address.split("!").reverse();
  return { position, sheet: (sheet ?? "").replaceAll("'", "") };
};

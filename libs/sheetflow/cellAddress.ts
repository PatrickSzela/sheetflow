export interface CellAddress {
  column: number;
  row: number;
  sheet: number;
}

export const buildCellAddress = (
  column: number,
  row: number,
  sheet: number,
): CellAddress => ({
  column,
  row,
  sheet,
});

export const isValidPartOfAddress = (number: unknown): number is number => {
  return (
    typeof number === "number" && Number.isSafeInteger(number) && number >= 0
  );
};

export const isCellAddress = (address: unknown): address is CellAddress => {
  const { column, row, sheet } = (address ?? {}) as CellAddress;

  return [column, row, sheet].every(isValidPartOfAddress);
};

export const areCellAddressesEqual = (
  address1: CellAddress,
  address2: CellAddress,
): boolean => {
  return (
    address1.column === address2.column &&
    address1.row === address2.row &&
    address1.sheet === address2.sheet
  );
};

export const extractDataFromStringAddress = (
  address: string,
): { position: string; sheet: string } => {
  const [position, sheet] = address.trim().split("!").reverse();
  // remove `'` from beginning and end of the sheet's name
  const sheetName = (sheet ?? "").replace(/^'+|'+$/g, "");
  return { position, sheet: sheetName };
};

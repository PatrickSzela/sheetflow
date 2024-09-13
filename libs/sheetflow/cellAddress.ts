export interface CellAddress {
  column: number;
  row: number;
  sheet: string;
}

export interface CellRange {
  start: CellAddress;
  end: CellAddress;
}

// TODO: add type guards for address, range etc
// TODO: safeguards (negative or floats, invalid strings etc)

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

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const numberToLetters = (number: number) => {
  let letters = "";

  while (number >= 0) {
    letters = `${alphabet[number % alphabet.length]}${letters}`;
    number = Math.floor(number / alphabet.length) - 1;
  }

  return letters;
};

export const lettersToNumbers = (letters: string) => {
  let number = 0;
  const arr = letters.split("");

  arr.reverse().forEach((letter, idx) => {
    number += Math.pow(alphabet.length, idx) * (alphabet.indexOf(letter) + 1);
  });

  return number - 1;
};

export const buildStringAddress = (
  column: number,
  row: number,
  sheet?: string
): string => {
  // TODO: support sheet names with white spaces
  const prefix = sheet ? `${sheet}!` : "";
  return `${prefix}${numberToLetters(column)}${row + 1}`;
};

export const buildStringFromCellAddress = ({
  column,
  row,
  sheet,
}: CellAddress): string => buildStringAddress(column, row, sheet);

export const buildCellAddressFromString = (address: string) => {
  const [colRow, sheetName] = address.replaceAll("$", "").split("!").reverse();
  const [column, row] = colRow.match(/[A-Z]+|[0-9]+/g) ?? [];

  if (!column || Number.isNaN(row))
    throw new Error(`\`${address}\` is not a valid address`);

  return buildCellAddress(lettersToNumbers(column), Number(row) - 1, sheetName);
};

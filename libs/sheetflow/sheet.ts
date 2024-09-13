import { buildStringAddress } from "@/libs/sheetflow/cellAddress";
import { Cell } from "./cell";

export type Sheet = Cell[][];
export type Sheets = Record<string, Sheet>;

export type CellList = Record<string, Cell>;

// TODO: come up with a better names

export const getCellList = (sheet: Sheet): CellList => {
  const list: CellList = {};

  for (let row = 0; row < sheet.length; row++) {
    for (let col = 0; col < sheet[row].length; col++) {
      const value = sheet[row][col];

      // skip empty cells
      if (typeof value === "undefined" || value === null) {
        continue;
      }

      const address = buildStringAddress(col, row);
      list[address] = value;
    }
  }

  return list;
};

export const getCellLists = (sheets: Sheets): CellList => {
  let obj: CellList = {};

  for (const sheetName of Object.keys(sheets)) {
    obj = { ...obj, ...getCellList(sheets[sheetName]) };
  }

  return obj;
};

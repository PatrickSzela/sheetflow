import { HyperFormula, SimpleCellAddress } from "hyperformula";
import { CellAddress } from "../sheetflow";

export const remapCellAddress = (
  hf: HyperFormula,
  { row, col, sheet }: SimpleCellAddress
): CellAddress => ({
  column: col,
  row: row,
  // TODO: store as ID like hyperformula?
  sheet: hf.getSheetName(sheet) ?? "MISSING",
});

import * as SheetFlow from "@/libs/sheetflow";
import { HyperFormula, SimpleCellAddress } from "hyperformula";

export const remapCellAddress = (
  hf: HyperFormula,
  { row, col, sheet }: SimpleCellAddress
): SheetFlow.CellAddress => ({
  column: col,
  row: row,
  // TODO: store as ID like hyperformula?
  sheet: hf.getSheetName(sheet) ?? "MISSING",
});

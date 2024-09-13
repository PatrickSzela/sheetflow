import * as SheetFlow from "@/libs/sheetflow";
import { HyperFormula, SimpleCellAddress, SimpleCellRange } from "hyperformula";

// TODO: unmap functions

export const remapCellAddress = (
  hf: HyperFormula,
  { row, col, sheet }: SimpleCellAddress
): SheetFlow.CellAddress =>
  SheetFlow.buildCellAddress(
    col,
    row,
    // TODO: store as ID like hyperformula?
    hf.getSheetName(sheet) ?? "MISSING"
  );

export const remapCellRange = (
  hf: HyperFormula,
  { start, end }: SimpleCellRange
): SheetFlow.CellRange =>
  SheetFlow.buildCellRange(
    remapCellAddress(hf, start),
    remapCellAddress(hf, end)
  );

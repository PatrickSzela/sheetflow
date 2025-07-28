import {
  type HyperFormula,
  type SimpleCellAddress,
  type SimpleCellRange,
} from "hyperformula";
import * as SheetFlow from "@/libs/sheetflow";
import { getSheetIdWithError } from "./utils";

export const remapCellAddress = (
  hf: HyperFormula,
  { row, col, sheet }: SimpleCellAddress,
): SheetFlow.CellAddress =>
  SheetFlow.buildCellAddress(
    col,
    row,
    // TODO: store as ID like hyperformula?
    hf.getSheetName(sheet) ?? "MISSING",
  );

export const unmapCellAddress = (
  hf: HyperFormula,
  { column, row, sheet }: SheetFlow.CellAddress,
): SimpleCellAddress => ({
  col: column,
  row,
  sheet: getSheetIdWithError(hf, sheet),
});

export const remapCellRange = (
  hf: HyperFormula,
  { start, end }: SimpleCellRange,
): SheetFlow.CellRange =>
  SheetFlow.buildCellRange(
    remapCellAddress(hf, start),
    remapCellAddress(hf, end),
  );

export const unmapCellRange = (
  hf: HyperFormula,
  { start, end }: SheetFlow.CellRange,
): SimpleCellRange => ({
  start: unmapCellAddress(hf, start),
  end: unmapCellAddress(hf, end),
});

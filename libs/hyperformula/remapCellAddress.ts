import { type SimpleCellAddress, type SimpleCellRange } from "hyperformula";
import * as SheetFlow from "@/libs/sheetflow";

export const remapCellAddress = ({
  row,
  col,
  sheet,
}: SimpleCellAddress): SheetFlow.CellAddress =>
  SheetFlow.buildCellAddress(col, row, sheet);

export const unmapCellAddress = ({
  column,
  row,
  sheet,
}: SheetFlow.CellAddress): SimpleCellAddress => ({
  col: column,
  row,
  sheet,
});

export const remapCellRange = ({
  start,
  end,
}: SimpleCellRange): SheetFlow.CellRange =>
  SheetFlow.buildCellRange(remapCellAddress(start), remapCellAddress(end));

export const unmapCellRange = ({
  start,
  end,
}: SheetFlow.CellRange): SimpleCellRange => ({
  start: unmapCellAddress(start),
  end: unmapCellAddress(end),
});

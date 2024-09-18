import * as SheetFlow from "@/libs/sheetflow";
import { Sheet, Sheets } from "hyperformula";

export const remapSheet = (sheet: Sheet): SheetFlow.Sheet => {
  return sheet;
};

export const remapSheets = (sheets: Sheets): SheetFlow.Sheets => {
  return sheets;
};

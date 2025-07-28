import { type Sheet, type Sheets } from "hyperformula";
import * as SheetFlow from "@/libs/sheetflow";

export const remapSheet = (sheet: Sheet): SheetFlow.Sheet => {
  return sheet;
};

export const remapSheets = (sheets: Sheets): SheetFlow.Sheets => {
  return sheets;
};

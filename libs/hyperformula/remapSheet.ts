import * as SheetFlow from "@/libs/sheetflow";
import { Sheet } from "hyperformula";

export const remapSheet = (sheet: Sheet): SheetFlow.Sheet => {
  return sheet;
};

export const remapSheets = (
  sheets: Record<string, Sheet>
): SheetFlow.Sheets => {
  return sheets;
};

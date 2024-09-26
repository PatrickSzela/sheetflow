import { CellContent } from "./cell";
import { buildCellAddress, CellAddress, isCellAddress } from "./cellAddress";
import { isCellRange } from "./cellRange";
import { NamedExpression, NamedExpressions } from "./namedExpression";
import { Reference, SheetFlow } from "./sheetflow";

export type Sheet = CellContent[][];
export type Sheets = Record<string, Sheet>;

// TODO: support row/column ranges

export type GroupedCells = Record<
  string,
  { address: CellAddress; stringAddress: string; content: CellContent }[]
>;

export const groupReferencesBySheet = (
  sf: SheetFlow,
  references: Reference[]
): {
  cells: GroupedCells;
  namedExpressions: NamedExpressions;
  missingSheets: string[];
  missingNamedExpressions: string[];
} => {
  const cells: Record<
    string,
    Record<string, GroupedCells[string][number]>
  > = {};
  const namedExpressions: Record<string, NamedExpression> = {};

  const missingSheets: Set<string> = new Set();
  const missingNamedExpressions: Set<string> = new Set();

  for (const precedent of references) {
    if (typeof precedent === "string") {
      if (!sf.doesNamedExpressionExists(precedent)) {
        missingNamedExpressions.add(precedent);
        continue;
      }

      namedExpressions[precedent] = sf.getNamedExpression(precedent);
    } else if (isCellAddress(precedent)) {
      const { sheet } = precedent;

      if (!sf.doesSheetExists(sheet)) {
        missingSheets.add(sheet);
        continue;
      }

      if (cells[sheet] === undefined) cells[sheet] = {};

      const stringAddress = sf.cellAddressToString(precedent);

      cells[sheet][stringAddress] = {
        address: precedent,
        stringAddress,
        content: sf.getCell(precedent),
      };
    } else if (isCellRange(precedent)) {
      const { start, end } = precedent;
      const { sheet } = start;

      if (!sf.doesSheetExists(sheet)) {
        missingSheets.add(sheet);
        continue;
      }

      if (cells[sheet] === undefined) cells[sheet] = {};

      for (let row = start.row; row <= end.row; row++) {
        for (let col = start.column; col <= end.column; col++) {
          const address = buildCellAddress(col, row, sheet);
          const stringAddress = sf.cellAddressToString(address);
          cells[sheet][stringAddress] = {
            address,
            stringAddress,
            content: sf.getCell(address),
          };
        }
      }
    }
  }

  const finalCells: GroupedCells = {};
  for (const key of Object.keys(cells)) {
    finalCells[key] = Object.values(cells[key]);
  }

  return {
    cells: finalCells,
    namedExpressions: Object.values(namedExpressions),
    missingSheets: Array.from(missingSheets),
    missingNamedExpressions: Array.from(missingNamedExpressions),
  };
};

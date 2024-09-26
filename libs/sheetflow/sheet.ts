import { CellContent } from "./cell";
import { buildCellAddress, CellAddress, isCellAddress } from "./cellAddress";
import { isCellRange } from "./cellRange";
import { NamedExpressions } from "./namedExpression";
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
) => {
  const cells: GroupedCells = {};
  const namedExpressions: NamedExpressions = [];

  const missingSheets: Set<string> = new Set();
  const missingNamedExpressions: Set<string> = new Set();

  for (const precedent of references) {
    if (typeof precedent === "string") {
      if (!sf.doesNamedExpressionExists(precedent)) {
        missingNamedExpressions.add(precedent);
        continue;
      }

      namedExpressions.push(sf.getNamedExpression(precedent));
    } else if (isCellAddress(precedent)) {
      const { sheet } = precedent;

      if (!sf.doesSheetExists(sheet)) {
        missingSheets.add(sheet);
        continue;
      }

      if (cells[sheet] === undefined) cells[sheet] = [];

      const stringAddress = sf.cellAddressToString(precedent);

      cells[sheet].push({
        address: precedent,
        stringAddress,
        content: sf.getCell(precedent),
      });
    } else if (isCellRange(precedent)) {
      const { start, end } = precedent;
      const { sheet } = start;

      if (!sf.doesSheetExists(sheet)) {
        missingSheets.add(sheet);
        continue;
      }

      if (cells[sheet] === undefined) cells[sheet] = [];

      for (let row = start.row; row <= end.row; row++) {
        for (let col = start.column; col <= end.column; col++) {
          const address = buildCellAddress(col, row, sheet);
          const stringAddress = sf.cellAddressToString(address);
          cells[sheet].push({
            address,
            stringAddress,
            content: sf.getCell(address),
          });
        }
      }
    }
  }

  return {
    cells,
    namedExpressions,
    missingSheets: Array.from(missingSheets),
    missingNamedExpressions: Array.from(missingNamedExpressions),
  };
};

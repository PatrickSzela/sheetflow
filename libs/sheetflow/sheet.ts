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
} => {
  const cells: Record<
    string,
    Record<string, GroupedCells[string][number]>
  > = {};
  const namedExpressions: Record<string, NamedExpression> = {};

  for (const ref of references) {
    if (typeof ref === "string") {
      if (!sf.doesNamedExpressionExists(ref)) {
        console.warn(`Named expression \`${ref}\` doesn't exists`);
        continue;
      }

      namedExpressions[ref] = sf.getNamedExpression(ref);
    } else if (isCellAddress(ref)) {
      const { sheet } = ref;

      if (!sf.doesSheetExists(sheet)) {
        console.warn(`Sheet \`${sheet}\` doesn't exists`);
        continue;
      }

      if (cells[sheet] === undefined) cells[sheet] = {};

      const stringAddress = sf.cellAddressToString(ref);

      cells[sheet][stringAddress] = {
        address: ref,
        stringAddress,
        content: sf.getCell(ref),
      };
    } else if (isCellRange(ref)) {
      const { start, end } = ref;
      const { sheet } = start;

      if (!sf.doesSheetExists(sheet)) {
        console.warn(`Sheet \`${sheet}\` doesn't exists`);
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
  };
};

import { type CellContent } from "./cell";
import {
  buildCellAddress,
  isCellAddress,
  type CellAddress,
} from "./cellAddress";
import { isCellRange } from "./cellRange";
import { type NamedExpression, type NamedExpressions } from "./namedExpression";
import { type Reference } from "./reference";
import { type SheetFlowEngine } from "./sheetflowEngine";

export type Sheet = CellContent[][];
export type Sheets = Record<string, Sheet>;

// TODO: support row/column ranges

export type GroupedCells = {
  address: CellAddress;
  stringAddress: string;
  content: CellContent;
}[][];

export const groupReferencesBySheet = (
  sf: SheetFlowEngine,
  references: Reference[],
): {
  cells: GroupedCells;
  namedExpressions: NamedExpressions;
} => {
  const cells: Record<string, GroupedCells[number][number]>[] = [];
  const namedExpressions: Record<string, NamedExpression> = {};

  for (const ref of references) {
    if (typeof ref === "string") {
      if (!sf.doesNamedExpressionExists(ref)) {
        continue;
      }

      namedExpressions[ref] = sf.getNamedExpression(ref);
    } else if (isCellAddress(ref)) {
      const { sheet } = ref;

      if (!sf.doesSheetWithIdExists(sheet)) {
        continue;
      }

      cells[sheet] ??= {};

      const stringAddress = sf.cellAddressToString(ref);

      cells[sheet][stringAddress] = {
        address: ref,
        stringAddress,
        content: sf.getCell(ref),
      };
    } else if (isCellRange(ref)) {
      const { start, end } = ref;
      const { sheet } = start;

      if (!sf.doesSheetWithIdExists(sheet)) {
        continue;
      }

      cells[sheet] ??= {};

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

  const finalCells: GroupedCells = [];
  cells.forEach((data, id) => {
    finalCells[id] = Object.values(data);
  });

  return {
    cells: finalCells,
    namedExpressions: Object.values(namedExpressions),
  };
};

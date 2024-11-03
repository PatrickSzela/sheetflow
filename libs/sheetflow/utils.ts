import {
  Ast,
  AstNodeSubtype,
  AstNodeType,
  isErrorAst,
  isNamedExpressionReferenceAst,
} from "./ast";
import { extractDataFromStringAddress } from "./cellAddress";
import { buildCellRange } from "./cellRange";
import { MissingReferences } from "./placedAst";
import { Reference } from "./reference";
import { SheetFlowEngine } from "./sheetflowEngine";

export enum SpecialSheets {
  PLACED_ASTS = "SheetFlow_Placed_ASTs",
}

// HyperFormula's `getCellPrecedents` doesn't like non-existing named expressions and it won't return the names of them
export const getPrecedents = (
  sf: SheetFlowEngine,
  flatAst: Ast[]
): Reference[] => {
  const precedents: Record<string, Reference> = {};

  for (const ast of flatAst) {
    if (ast.type !== AstNodeType.REFERENCE) continue;

    switch (ast.subtype) {
      case AstNodeSubtype.CELL:
        precedents[sf.cellAddressToString(ast.reference)] = {
          ...ast.reference,
        };
        break;

      case AstNodeSubtype.NAMED_EXPRESSION:
        precedents[ast.expressionName] = ast.expressionName;
        break;

      case AstNodeSubtype.CELL_RANGE:
        const cellRange = buildCellRange(ast.start, ast.end);
        precedents[sf.cellRangeToString(cellRange)] = cellRange;
        break;

      case AstNodeSubtype.COLUMN_RANGE:
        // // TODO: column range to string
        // precedents[ast.rawContent] = buildCellRange(
        //   buildCellAddress(ast.start, 0, ast.sheet),
        //   buildCellAddress(ast.start, Infinity, ast.sheet)
        // );
        // break;
        throw new Error("Row range not supported");

      case AstNodeSubtype.ROW_RANGE:
        // // TODO: row range to string
        // precedents[ast.rawContent] = buildCellRange(
        //   buildCellAddress(0, ast.start, ast.sheet),
        //   buildCellAddress(Infinity, ast.start, ast.sheet)
        // );
        // break;
        throw new Error("Row range not supported");
    }
  }

  return Object.values(precedents);
};

export const getMissingSheetsAndNamedExpressions = (
  sf: SheetFlowEngine,
  flatAst: Ast[]
): MissingReferences => {
  const namedExpressions: Set<string> = new Set();
  const sheets: Set<string> = new Set();

  for (const ast of flatAst) {
    if (isErrorAst(ast) && ast.error === "REF") {
      const { sheet } = extractDataFromStringAddress(ast.rawContent);

      if (sheet && !sf.doesSheetExists(sheet)) {
        sheets.add(sheet);
      }
    } else if (
      isNamedExpressionReferenceAst(ast) &&
      !sf.doesNamedExpressionExists(ast.expressionName)
    ) {
      namedExpressions.add(ast.expressionName);
    }
  }

  return {
    namedExpressions: Array.from(namedExpressions),
    sheets: Array.from(sheets),
  };
};

// go home ESLint, you're drunk
/* eslint-disable react/no-is-mounted */

import TypedEmitter from "typed-emitter";
import {
  Ast,
  AstNodeSubtype,
  AstNodeType,
  isEmptyAst,
  isErrorAst,
  isNamedExpressionReferenceAst,
} from "./ast";
import { CellContent } from "./cell";
import {
  buildCellAddress,
  CellAddress,
  extractDataFromStringAddress,
} from "./cellAddress";
import { buildCellRange, CellRange } from "./cellRange";
import { buildEmptyCellValue, CellValue, Value } from "./cellValue";
import { Change } from "./change";
import { flattenAst } from "./flattenAst";
import { NamedExpression, NamedExpressions } from "./namedExpression";
import { Sheet, Sheets } from "./sheet";
import { SpecialSheets } from "./utils";

export type Reference = CellAddress | CellRange | string;

export type Events = {
  // TODO: removed sheet & named expression
  sheetAdded: (sheet: string) => void;
  namedExpressionAdded: (sheet: string) => void;
  valuesChanged: (changes: Change[]) => void;
};
export type EngineEventEmitter = TypedEmitter<Events>;

export type AstSheetData = Record<
  string,
  { row: number; ast: Ast; flatAst: Ast[]; address: CellAddress }
>;

// TODO: move rest of the helpers in here
// TODO: row/column range to string and from string
// TODO: unify ranges

// TODO: store AST as named expressions instead of in a sheet once supported
// https://github.com/handsontable/hyperformula/issues/241
// Issues:
// - only absolute addresses are allowed
// - call calculateFormula instead of getNamedExpressionValue
// - named expression name limitations
// - nodes from getNodes() contain address instead of named expression's name and no scope

export abstract class SheetFlow {
  protected astSheets: AstSheetData;

  constructor() {
    this.astSheets = {};

    // TODO: remove
    // @ts-expect-error make HF instance available in browser's console
    window.engine = this;
  }

  static build(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: any
  ): SheetFlow {
    throw new Error("Called `build` function on an abstract class");
  }

  abstract stringToCellAddress(address: string): CellAddress;
  abstract stringToCellRange(range: string): CellRange;
  abstract cellAddressToString(address: CellAddress): string;
  abstract cellRangeToString(range: CellRange): string;

  abstract getCellValue(address: CellAddress): CellValue;
  abstract getArrayCellValue(address: CellAddress): Value;

  abstract getCell(address: CellAddress): CellContent;
  abstract setCell(address: CellAddress, content: CellContent): void;

  // HyperFormula's `getCellPrecedents` doesn't like non-existing named expressions and it won't return the names of them
  getPrecedents(flatAst: Ast[]): Reference[] {
    const precedents: Record<string, Reference> = {};

    for (const ast of flatAst) {
      if (ast.type !== AstNodeType.REFERENCE) continue;

      switch (ast.subtype) {
        case AstNodeSubtype.CELL:
          precedents[this.cellAddressToString(ast.reference)] = {
            ...ast.reference,
          };
          break;

        case AstNodeSubtype.NAMED_EXPRESSION:
          precedents[ast.expressionName] = ast.expressionName;
          break;

        case AstNodeSubtype.CELL_RANGE:
          const cellRange = buildCellRange(ast.start, ast.end);
          precedents[this.cellRangeToString(cellRange)] = cellRange;
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
  }

  abstract addSheet(name: string, content?: Sheet): void;
  abstract removeSheet(name: string): void;
  abstract renameSheet(name: string, newName: string): void;
  abstract getSheet(name: string): Sheet;
  abstract setSheet(name: string, content: Sheet): void;
  abstract doesSheetExists(name: string): boolean;
  abstract getAllSheets(): Sheets;

  abstract getAllSheetNames(): string[];

  abstract clearRow(sheet: string, index: number): void;

  abstract getNamedExpressions(): NamedExpressions;
  abstract getNamedExpression(name: string, scope?: string): NamedExpression;
  abstract setNamedExpression(
    name: string,
    content: CellContent,
    scope?: string
  ): void;
  abstract removeNamedExpression(name: string, scope?: string): void;
  abstract getNamedExpressionValue(name: string, scope?: string): Value;
  abstract doesNamedExpressionExists(name: string, scope?: string): boolean;

  abstract isFormulaValid(formula: string): boolean;
  abstract normalizeFormula(formula: string): string;

  abstract getAstFromAddress(address: CellAddress, uuid?: string): Ast;
  abstract getAstFromFormula(
    formula: string,
    scope: string,
    uuid?: string
  ): Ast;
  abstract astToFormula(ast: Ast): string;
  abstract calculateFormula(formula: string, sheet: string): Value;

  abstract pauseEvaluation(): void;
  abstract resumeEvaluation(): void;

  abstract on: EngineEventEmitter["on"];
  abstract off: EngineEventEmitter["off"];

  protected getFirstAvailableRow() {
    let values = Object.values(this.astSheets);
    if (!values.length) return 0;

    // while this will break if there are duplicates in the array or if the number isn't an integer, but this should never happen
    const items = values.map((i) => i.row).sort((a, b) => a - b);
    const empty = items.find((row, idx) => row !== idx);

    if (empty === undefined) return items.length + 1;
    return empty - 1;
  }

  getExistingAstData(uuid: string): AstSheetData[string] | undefined {
    return this.astSheets[uuid];
  }

  getFormulaAst(formula: string, scope: string, place: boolean = false) {
    if (!this.isFormulaValid(formula))
      throw new Error(`Formula \`${formula}\` is not a valid formula`);

    const normalizedFormula = this.normalizeFormula(formula);
    const uuid = crypto.randomUUID();
    const row = this.getFirstAvailableRow();

    const address = buildCellAddress(0, row, SpecialSheets.FORMULAS);

    const ast = this.getAstFromFormula(normalizedFormula, scope, uuid);
    const flatAst = flattenAst(ast);

    if (place) {
      this.clearRow(address.sheet, row);
      this.astSheets[uuid] = { row, ast, flatAst, address };
      this.placeFormulaAst(flatAst, uuid);
    } else {
      this.removeFormulaAst(uuid);
    }

    return { uuid, ast, flatAst, address };
  }

  placeFormulaAst(flatAst: Ast[], uuid: string) {
    const row =
      uuid in this.astSheets
        ? this.astSheets[uuid].row
        : this.getFirstAvailableRow();

    flatAst.forEach((ast, idx) => {
      const address = buildCellAddress(idx, row, SpecialSheets.FORMULAS);
      this.setCell(address, this.astToFormula(ast));
    });
  }

  removeFormulaAst(uuid: string) {
    if (!(uuid in this.astSheets))
      throw new Error(`UUID \`${uuid}\` not found`);

    this.clearRow(SpecialSheets.FORMULAS, this.astSheets[uuid].row);
    delete this.astSheets[uuid];
  }

  calculateFormulaAst(flatAst: Ast[]): Value[] {
    return flatAst.map((ast) =>
      isEmptyAst(ast)
        ? buildEmptyCellValue({ value: null })
        : this.calculateFormula(this.astToFormula(ast), SpecialSheets.FORMULAS)
    );
  }

  getFormulaAstValues(uuid: string) {
    if (!(uuid in this.astSheets))
      throw new Error(`UUID \`${uuid}\` not found`);

    return this.calculateFormulaAst(this.astSheets[uuid].flatAst);
  }

  // TODO: remove
  getPlacedFormulaAstValues(uuid: string) {
    if (!(uuid in this.astSheets))
      throw new Error(`UUID \`${uuid}\` not found`);

    const { row, flatAst } = this.astSheets[uuid];

    return flatAst.map((_, idx) => {
      const address = buildCellAddress(idx, row, SpecialSheets.FORMULAS);
      return this.getArrayCellValue(address);
    });
  }

  isFormulaAstPartOfChanges(uuid: string, changes: Change[]): boolean {
    if (!(uuid in this.astSheets))
      throw new Error(`UUID \`${uuid}\` not found`);

    return !!changes.find((change) => {
      if ("address" in change) {
        return (
          change.address.sheet === SpecialSheets.FORMULAS &&
          change.address.row === this.astSheets[uuid].row
        );
      }

      return false;
    });
  }

  getCellList(sheetName: string): Reference[] {
    const list: Reference[] = [];
    const sheet = this.getSheet(sheetName);

    for (let row = 0; row < sheet.length; row++) {
      for (let col = 0; col < sheet[row].length; col++) {
        const content = sheet[row][col];

        // skip empty cells
        if (content === undefined || content === null) {
          continue;
        }

        const address = buildCellAddress(col, row, sheetName);
        list.push(address);
      }
    }

    return list;
  }

  getCellLists(): Reference[] {
    let list: Reference[] = [];

    for (const sheetName of this.getAllSheetNames()) {
      list = [...list, ...this.getCellList(sheetName)];
    }

    return list;
  }

  getMissingSheetsAndNamedExpressions(flatAst: Ast[]): {
    namedExpressions: string[];
    sheets: string[];
  } {
    const namedExpressions: Set<string> = new Set();
    const sheets: Set<string> = new Set();

    for (const ast of flatAst) {
      if (isErrorAst(ast) && ast.error === "REF") {
        const { sheet } = extractDataFromStringAddress(ast.rawContent);

        if (sheet && !this.doesSheetExists(sheet)) {
          sheets.add(sheet);
        }
      } else if (
        isNamedExpressionReferenceAst(ast) &&
        !this.doesNamedExpressionExists(ast.expressionName)
      ) {
        namedExpressions.add(ast.expressionName);
      }
    }

    return {
      namedExpressions: Array.from(namedExpressions),
      sheets: Array.from(sheets),
    };
  }
}

// go home ESLint, you're drunk
/* eslint-disable react/no-is-mounted */

import TypedEmitter from "typed-emitter";
import { Ast, AstNodeSubtype, AstNodeType } from "./ast";
import { CellContent } from "./cell";
import { buildCellAddress, CellAddress, CellRange } from "./cellAddress";
import { CellValue, Value } from "./cellValue";
import { flattenAst } from "./flattenAst";
import { NamedExpressions, NamedExpression } from "./namedExpression";
import { CellList, Sheet, Sheets } from "./sheet";
import { buildFormulaSheetName } from "./utils";

export type CellChange = { address: CellAddress; value: Value };
export type NamedExpressionChange = { name: string; value: Value };
export type Change = CellChange | NamedExpressionChange;
export type Precedent = CellAddress | CellRange | string;
export type Precedents = Precedent[];

export type Events = {
  valuesChanged: (changes: Change[]) => void;
};

export type EngineEventEmitter = TypedEmitter<Events>;

// TODO: move rest of the helpers in here

export abstract class SheetFlow {
  protected _astSheets: Record<string, string[]>;

  constructor() {
    this._astSheets = {};
  }

  static build(sheets?: Sheets, config?: any): SheetFlow {
    throw new Error("Called `build` function on an abstract class");
  }

  abstract stringToCellAddress(address: string): CellAddress;
  abstract cellAddressToString(address: CellAddress): string;

  abstract getCellValue(address: CellAddress): CellValue;
  abstract getArrayCellValue(address: CellAddress): CellValue[][];

  abstract getCell(address: CellAddress): CellContent;
  abstract setCell(address: CellAddress, content: CellContent): void;

  // HyperFormula's `getCellPrecedents` doesn't like non-existing named expressions and it won't return the names of them
  getPrecedents(flatAst: Ast[]): Precedents {
    const precedents: Precedents = [];

    for (const ast of flatAst) {
      if (ast.type !== AstNodeType.REFERENCE) continue;

      switch (ast.subtype) {
        case AstNodeSubtype.CELL:
          precedents.push({ ...ast.reference });
          break;

        case AstNodeSubtype.NAMED_EXPRESSION:
          precedents.push(ast.expressionName);
          break;

        case AstNodeSubtype.CELL_RANGE:
          precedents.push({ start: { ...ast.start }, end: { ...ast.end } });
          break;

        case AstNodeSubtype.COLUMN_RANGE:
          precedents.push({
            start: buildCellAddress(ast.start, 0, ast.sheet),
            end: buildCellAddress(ast.start, Infinity, ast.sheet),
          });
          break;

        case AstNodeSubtype.ROW_RANGE:
          precedents.push({
            start: buildCellAddress(0, ast.start, ast.sheet),
            end: buildCellAddress(Infinity, ast.start, ast.sheet),
          });
          break;
      }
    }
    return precedents;
  }

  abstract addSheet(name: string, content?: Sheet): void;
  abstract removeSheet(name: string): void;
  abstract renameSheet(name: string, newName: string): void;
  abstract getSheet(name: string): Sheet;
  abstract setSheet(name: string, content: Sheet): void;
  abstract doesSheetExists(name: string): boolean;
  abstract getAllSheets(): Sheets;

  abstract getAllSheetNames(): string[];

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

  abstract getAst(address: CellAddress, uuid?: string): Ast;

  abstract pauseEvaluation(): void;
  abstract resumeEvaluation(): void;

  abstract on: EngineEventEmitter["on"];
  abstract off: EngineEventEmitter["off"];

  getFormulaAst(
    formula: string,
    placeAst: boolean = true,
    replaceUuid?: string
  ) {
    if (!this.isFormulaValid(formula))
      throw new Error(`Formula \`${formula}\` is not a valid formula`);

    const normalizedFormula = this.normalizeFormula(formula);
    const uuid = crypto.randomUUID();
    const address = buildCellAddress(0, 0, buildFormulaSheetName(uuid, 0));

    if (replaceUuid) {
      if (!(replaceUuid in this._astSheets))
        throw new Error(`UUID \`${replaceUuid}\` not found`);

      this._astSheets[uuid] = this._astSheets[replaceUuid].map(
        (astSheetName, idx) => {
          const name = buildFormulaSheetName(uuid, idx);

          this.renameSheet(astSheetName, name);
          this.setSheet(name, [[]]);

          return name;
        }
      );

      delete this._astSheets[replaceUuid];

      this.setSheet(address.sheet, [[normalizedFormula]]);
    } else {
      this.addSheet(address.sheet, [[normalizedFormula]]);
      this._astSheets[uuid] = [address.sheet];
    }

    const ast = this.getAst(address);
    const flatAst = flattenAst(ast);

    if (placeAst) {
      this.placeAst(flatAst, uuid, 1);
    } else {
      this.removePlacedAst(uuid);
    }

    return { uuid, ast, flatAst, address };
  }

  // TODO: store AST as named expressions instead of sheets once supported
  // https://github.com/handsontable/hyperformula/issues/241
  placeAst(flatAst: Ast[], uuid: string, startingIndex: number = 0) {
    flatAst.slice(startingIndex).forEach((ast, idx) => {
      // TODO: move to HyperFormula
      // every language supported by HF doesn't translate `ARRAYFORMULA` function name, so this should theoretically always work
      const formula = ast.isArrayFormula
        ? `=ARRAYFORMULA(${ast.rawContent})`
        : `=${ast.rawContent}`;

      const sheetName = buildFormulaSheetName(uuid, idx + startingIndex);

      if (this._astSheets[uuid][idx + startingIndex]) {
        this.setSheet(sheetName, [[formula]]);
      } else {
        this.addSheet(sheetName, [[formula]]);
        this._astSheets[uuid].push(sheetName);
      }
    });
  }

  removePlacedAst(uuid: string) {
    if (!(uuid in this._astSheets))
      throw new Error(`UUID \`${uuid}\` not found`);

    for (const name of this._astSheets[uuid]) {
      this.removeSheet(name);
    }

    delete this._astSheets[uuid];
  }

  getPlacedAstValues(uuid: string) {
    const values: Value[] = [];

    if (!(uuid in this._astSheets))
      throw new Error(`UUID \`${uuid}\` not found`);

    for (const name of this._astSheets[uuid]) {
      const address = buildCellAddress(0, 0, name);
      // TODO: support arrays
      values.push(this.getCellValue(address));
    }

    return values;
  }

  getCellList(sheetName: string) {
    const list: CellList = {};
    const sheet = this.getSheet(sheetName);

    for (let row = 0; row < sheet.length; row++) {
      for (let col = 0; col < sheet[row].length; col++) {
        const value = sheet[row][col];

        // skip empty cells
        if (value === undefined || value === null) {
          continue;
        }

        const address = buildCellAddress(col, row, sheetName);
        const stringAddress = this.cellAddressToString(address);

        list[stringAddress] = value;
      }
    }

    return list;
  }

  getCellLists() {
    let obj: CellList = {};

    for (const sheetName of this.getAllSheetNames()) {
      obj = { ...obj, ...this.getCellList(sheetName) };
    }

    return obj;
  }
}

// go home ESLint, you're drunk
/* eslint-disable react/no-is-mounted */

import TypedEmitter from "typed-emitter";
import { Ast } from "./ast";
import { CellContent } from "./cell";
import { buildCellAddress, CellAddress, CellRange } from "./cellAddress";
import { CellValue, Value } from "./cellValue";
import { flattenAst } from "./flattenAst";
import { CellList, Sheet, Sheets } from "./sheet";
import { buildFormulaSheetName } from "./utils";

export type CellChange = { address: CellAddress; value: Value };
export type NamedExpressionChange = { name: string; value: Value };
export type Change = (CellChange | NamedExpressionChange);

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

  abstract getCellPrecedents(address: CellAddress): (CellAddress | CellRange)[];

  abstract addSheet(name: string, content?: Sheet): void;
  abstract removeSheet(name: string): void;
  abstract getSheet(name: string): Sheet;
  abstract setSheet(name: string, content: Sheet): void;
  abstract doesSheetExists(name: string): boolean;
  abstract getAllSheets(): Sheets;

  abstract getAllSheetNames(): string[];

  abstract isFormulaValid(formula: string): boolean;
  abstract normalizeFormula(formula: string): string;

  abstract getAst(address: CellAddress, uuid?: string): Ast;

  abstract pauseEvaluation(): void;
  abstract resumeEvaluation(): void;

  abstract on: EngineEventEmitter["on"];
  abstract off: EngineEventEmitter["off"];

  getFormulaAst(formula: string, removePlacedAst: boolean = true) {
    if (!this.isFormulaValid(formula))
      throw new Error(`Formula \`${formula}\` is not a valid formula`);

    const normalizedFormula = this.normalizeFormula(formula);
    const uuid = crypto.randomUUID();
    const address = buildCellAddress(0, 0, buildFormulaSheetName(uuid, 0));

    this.addSheet(address.sheet, [[normalizedFormula]]);
    this._astSheets[uuid] = [address.sheet];

    const ast = this.getAst(address);
    const flatAst = flattenAst(ast);

    if (removePlacedAst) {
      this.removePlacedAst(uuid);
    }

    return { uuid, ast, flatAst, address };
  }

  // TODO: store AST as named expressions instead of sheets?
  placeAst(flatAst: Ast[], uuid: string) {
    flatAst.forEach((ast, idx) => {
      // TODO: move to HyperFormula
      // every language supported by HF doesn't translate `ARRAYFORMULA` function name, so this should theoretically always work
      const formula = ast.isArrayFormula
        ? `=ARRAYFORMULA(${ast.rawContent})`
        : `=${ast.rawContent}`;

      const sheetName = buildFormulaSheetName(uuid, idx + 1);

      this.addSheet(sheetName, [[formula]]);
      this._astSheets[uuid].push(sheetName);
    });
  }

  removePlacedAst(uuid: string) {
    if (!(uuid in this._astSheets)) throw new Error();

    for (const name of this._astSheets[uuid]) {
      this.removeSheet(name);
    }

    delete this._astSheets[uuid];
  }

  getPlacedAstValues(uuid: string) {
    const values: Value[] = [];

    if (!(uuid in this._astSheets)) throw new Error();

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

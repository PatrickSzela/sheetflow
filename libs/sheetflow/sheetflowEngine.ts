import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import { isEmptyAst, type Ast } from "./ast";
import { type CellContent } from "./cell";
import {
  buildCellAddress,
  isValidPartOfAddress,
  type CellAddress,
} from "./cellAddress";
import { type CellRange } from "./cellRange";
import { buildEmptyCellValue, type CellValue, type Value } from "./cellValue";
import { type Change } from "./change";
import { getPrettyLanguage } from "./config";
import { flattenAst } from "./flattenAst";
import { type NamedExpression, type NamedExpressions } from "./namedExpression";
import { PlacedAst } from "./placedAst";
import { type Reference } from "./reference";
import { type Sheet, type Sheets } from "./sheet";
import {
  SpecialSheets,
  getMissingSheetsAndNamedExpressions,
  getPrecedents,
} from "./utils";

export type SheetFlowConfig = {
  language: string;
};

export type SheetFlowEvents = {
  // TODO: removed sheet & named expression
  configChanged: (config: SheetFlowConfig) => void;
  sheetAdded: (sheet: string) => void;
  namedExpressionAdded: (name: string) => void;
  valuesChanged: (changes: Change[]) => void;
};
export type SheetFlowEventEmitter = TypedEmitter<SheetFlowEvents>;

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

export abstract class SheetFlowEngine {
  static readonly DEFAULT_CONFIG = {
    language: "en-US",
  } satisfies SheetFlowConfig;

  protected valueErrorTypes: Record<string, string> = {
    "DIV/0": "#DIV/0!",
    "N/A": "#N/A",
    NAME: "#NAME?",
    NULL: "#NULL!",
    NUM: "#NUM!",
    REF: "#REF!",
    VALUE: "#VALUE!",
  };

  protected config: SheetFlowConfig;
  protected placedAsts: Record<string, PlacedAst> = {};
  protected eventEmitter: SheetFlowEventEmitter =
    new EventEmitter() as SheetFlowEventEmitter;

  static build(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: Partial<SheetFlowConfig>,
  ): SheetFlowEngine {
    throw new Error("Called `build` function on an abstract class");
  }

  constructor(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: Partial<SheetFlowConfig>,
  ) {
    this.config = { ...SheetFlowEngine.DEFAULT_CONFIG, ...config };

    // TODO: remove
    // @ts-expect-error make HF instance available in browser's console
    window.sf = this;
  }

  registerEvents(): void {
    const astValuesChangedListener: SheetFlowEvents["valuesChanged"] = (
      changes,
    ) => {
      for (const uuid of Object.keys(this.placedAsts)) {
        if (this.isPlacedAstPartOfChanges(uuid, changes)) {
          this.placedAsts[uuid].updateValues(
            this.calculatePlacedAstAsRecord(uuid),
          );
        }
      }
    };

    const sheetNamedExpressionAdded: SheetFlowEvents["sheetAdded"] = (name) => {
      for (const uuid of Object.keys(this.placedAsts)) {
        const { data } = this.placedAsts[uuid];
        const { formula, scope } = data;

        // TODO: that's kinda naive, figure out a better way to check if sheet/named expression is part of the ast
        if (formula.includes(name)) {
          this.updatePlacedAstWithFormula(uuid, formula, scope);
        }
      }
    };

    this.on("valuesChanged", astValuesChangedListener);
    this.on("sheetAdded", sheetNamedExpressionAdded);
    this.on("namedExpressionAdded", sheetNamedExpressionAdded);
  }

  // #region abstract methods
  // engine

  // conversion
  abstract stringToCellAddress(address: string): CellAddress;
  abstract stringToCellRange(range: string): CellRange;
  abstract cellAddressToString(address: CellAddress): string;
  abstract cellRangeToString(range: CellRange): string;

  // cell
  abstract getCell(address: CellAddress): CellContent;
  abstract setCell(address: CellAddress, content: CellContent): void;
  abstract getCellValue(address: CellAddress): CellValue;
  abstract getArrayCellValue(address: CellAddress): Value;

  // sheet
  abstract getSheetId(name: string): number | undefined;
  abstract getSheetIdWithError(name: string): number;
  abstract getSheetName(id: number): string | undefined;
  abstract getSheetNameWithError(id: number): string;
  abstract getSheet(id: number): Sheet;
  abstract setSheet(id: number, content: Sheet): void;
  abstract addSheet(name: string, content?: Sheet): void;
  abstract renameSheet(id: number, newName: string): void;
  abstract removeSheet(id: number): void;
  abstract doesSheetExists(name: string): boolean;
  abstract doesSheetWithIdExists(id: number): boolean;
  abstract getAllSheets(): Sheets;
  abstract getAllSheetNames(): string[];
  abstract clearRow(sheet: number, index: number): void;

  // named expression
  abstract getNamedExpression(name: string, scope?: number): NamedExpression;
  abstract setNamedExpression(
    name: string,
    content: CellContent,
    scope?: number,
  ): void;
  abstract addNamedExpression(
    name: string,
    content?: CellContent,
    scope?: number,
  ): void;
  abstract removeNamedExpression(name: string, scope?: number): void;
  abstract doesNamedExpressionExists(name: string, scope?: number): boolean;
  abstract getNamedExpressionValue(name: string, scope?: number): Value;
  abstract getAllNamedExpressions(): NamedExpressions;
  abstract getAllNamedExpressionNames(): string[];

  // formula
  abstract isFormulaValid(formula: string): boolean;
  abstract normalizeFormula(formula: string): string;
  abstract calculateFormula(formula: string, sheetId: number): Value;

  // formula AST
  abstract getAstFromAddress(address: CellAddress, uuid?: string): Ast;
  abstract getAstFromFormula(uuid: string, formula: string, scope: number): Ast;
  abstract astToFormula(ast: Ast): string;

  // evaluation
  abstract pauseEvaluation(): void;
  abstract resumeEvaluation(): void;
  // #endregion

  once: SheetFlowEventEmitter["once"] = (...args) =>
    this.eventEmitter.once(...args);
  on: SheetFlowEventEmitter["on"] = (...args) => this.eventEmitter.on(...args);
  off: SheetFlowEventEmitter["off"] = (...args) =>
    this.eventEmitter.off(...args);

  protected getFirstAvailableRowForPlaceableAst(): number {
    const values = Object.values(this.placedAsts);
    if (!values.length) return 0;

    // while this will break if there are duplicates in the array or if the number isn't an integer, but this should never happen
    const items = values.map((i) => i.address.row).sort((a, b) => a - b);
    const empty = items.find((row, idx) => row !== idx);

    if (empty === undefined) return items.length + 1;
    return empty - 1;
  }

  getConfig(): Readonly<SheetFlowConfig> {
    return this.config;
  }

  updateConfig(config: Partial<SheetFlowConfig>): void {
    this.config = { ...this.config, ...config };
    this.eventEmitter.emit("configChanged", this.config);
  }

  getLanguage(): string {
    return this.config.language;
  }

  setLanguage(languageCode: string): void {
    this.updateConfig({ language: languageCode });
  }

  static getAllLanguages(): string[] {
    return [];
  }

  static getAllPrettyLanguages(): Record<string, string> {
    return Object.fromEntries(
      this.getAllLanguages().map((v, _, arr) => [v, getPrettyLanguage(v, arr)]),
    );
  }

  isAstPlaced(uuid: string): boolean {
    return uuid in this.placedAsts;
  }

  getPlacedAst(uuid: string): PlacedAst {
    if (!(uuid in this.placedAsts))
      throw new Error(`UUID \`${uuid}\` not found`);

    return this.placedAsts[uuid];
  }

  createPlacedAst(formula?: string, scope?: number): PlacedAst {
    const uuid = crypto.randomUUID();
    const row = this.getFirstAvailableRowForPlaceableAst();
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);
    const address = buildCellAddress(0, row, sheetId);

    const placedAst = new PlacedAst(uuid, address);
    this.placedAsts[uuid] = placedAst;

    // TODO: warning when one of the args is passed but the other isn't
    if (formula && isValidPartOfAddress(scope)) {
      this.updatePlacedAstWithFormula(uuid, formula, scope);
    }

    return placedAst;
  }

  placeAst(uuid: string): void {
    const { address, data } = this.getPlacedAst(uuid);
    const { row } = address;
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);

    data.flatAst.forEach((ast, idx) => {
      const address = buildCellAddress(idx, row, sheetId);
      this.setCell(address, this.astToFormula(ast));
    });
  }

  removePlacedAst(uuid: string): void {
    const placedAst = this.getPlacedAst(uuid);
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);

    this.clearRow(sheetId, placedAst.address.row);
    delete this.placedAsts[uuid];
  }

  calculatePlacedAst(uuid: string): Value[] {
    const { data } = this.getPlacedAst(uuid);

    return data.flatAst.map((ast) =>
      isEmptyAst(ast)
        ? buildEmptyCellValue({ value: null })
        : this.calculateFormula(
            this.astToFormula(ast),
            this.getSheetIdWithError(SpecialSheets.PLACED_ASTS),
          ),
    );
  }

  calculatePlacedAstAsRecord(uuid: string): Record<string, Value> {
    const { data } = this.getPlacedAst(uuid);
    const values = this.calculatePlacedAst(uuid);
    const groupedValues: Record<string, Value> = {};

    data.flatAst.forEach((ast, idx) => {
      groupedValues[ast.id] = values[idx];
    });

    return groupedValues;
  }

  updatePlacedAstWithFormula(
    uuid: string,
    formula: string,
    scope: number,
  ): PlacedAst {
    if (!this.isFormulaValid(formula))
      throw new Error(`Formula \`${formula}\` is not a valid formula`);

    if (!this.doesSheetWithIdExists(scope))
      throw new Error(`Sheet with ID \`${scope}\` doesn't exists`);

    const placedAst = this.getPlacedAst(uuid);
    const normalizedFormula = this.normalizeFormula(formula);
    const { address } = placedAst;

    const ast = this.getAstFromFormula(
      crypto.randomUUID(),
      normalizedFormula,
      scope,
    );
    const flatAst = flattenAst(ast);
    const missing = getMissingSheetsAndNamedExpressions(this, flatAst);
    const precedents = getPrecedents(this, flatAst);

    placedAst.updateData({ formula, scope, ast, flatAst, precedents, missing });

    this.pauseEvaluation();
    this.clearRow(address.sheet, address.row);
    this.placeAst(uuid);
    this.resumeEvaluation();

    return placedAst;
  }

  isPlacedAstPartOfChanges(uuid: string, changes: Change[]): boolean {
    const { address } = this.getPlacedAst(uuid);
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);

    return !!changes.find((change) => {
      if ("address" in change) {
        return (
          change.address.sheet === sheetId && change.address.row === address.row
        );
      }

      return false;
    });
  }

  recalculateEverything(): void {
    for (const uuid of Object.keys(this.placedAsts)) {
      const { formula, scope } = this.placedAsts[uuid].data;
      this.updatePlacedAstWithFormula(uuid, formula, scope);
    }
  }

  isErrorType(error: string): boolean {
    return error in this.valueErrorTypes;
  }

  isCalculatedValueAnError(value: CellValue["value"]): boolean {
    return (
      typeof value === "string" &&
      Object.values(this.valueErrorTypes).includes(value)
    );
  }

  getNonEmptyCellsFromSheet(sheetId: number): Reference[] {
    const list: Reference[] = [];
    const sheet = this.getSheet(sheetId);

    for (let row = 0; row < sheet.length; row++) {
      for (let col = 0; col < sheet[row].length; col++) {
        const content = sheet[row][col];

        // skip empty cells
        if (content === undefined || content === null) {
          continue;
        }

        const address = buildCellAddress(col, row, sheetId);
        list.push(address);
      }
    }

    return list;
  }

  getAllNonEmptyCells(): Reference[] {
    let list: Reference[] = [];

    for (const sheetName of this.getAllSheetNames()) {
      list = [
        ...list,
        ...this.getNonEmptyCellsFromSheet(this.getSheetIdWithError(sheetName)),
      ];
    }

    return list;
  }
}

import EventEmitter from "events";
import equal from "fast-deep-equal";
import type TypedEmitter from "typed-emitter";
import { isEmptyAst, type Ast } from "./ast";
import { type CellContent } from "./cell";
import {
  areCellAddressesEqual,
  buildCellAddress,
  isCellAddress,
  type CellAddress,
} from "./cellAddress";
import { type CellRange } from "./cellRange";
import { buildEmptyCellValue, type CellValue, type Value } from "./cellValue";
import { type Change } from "./change";
import { getPrettyLanguage } from "./config";
import { flattenAst } from "./flattenAst";
import { type NamedExpression, type NamedExpressions } from "./namedExpression";
import {
  PlacedAst,
  type PlacedAstFlowSettings,
  type PlacedAstSource,
} from "./placedAst";
import { type Reference } from "./reference";
import { type Sheet, type Sheets } from "./sheet";
import {
  SpecialSheets,
  getMissingSheetsAndNamedExpressions,
  getPrecedents,
} from "./utils";

export type SheetFlowConfig = {
  language: string;
  flow: PlacedAstFlowSettings;
};

export type SheetFlowEvents = {
  // TODO: removed sheet & named expression
  configChanged: (config: SheetFlowConfig) => void;
  sheetAdded: (sheet: string) => void;
  namedExpressionAdded: (name: string) => void;
  valuesChanged: (changes: Change[]) => void;
  cellContentChanged: (address: CellAddress, content: CellContent) => void;
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
    flow: {
      generateParenthesis: false,
      generateValues: true,
    },
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
      for (const id of Object.keys(this.placedAsts)) {
        if (this.isPlacedAstPartOfChanges(id, changes)) {
          const placedAst = this.placedAsts[id];
          placedAst.updateValues(this.calculatePlacedAstAsRecord(id));
          placedAst.injectValues();
        }
      }
    };

    const sheetNamedExpressionAdded: SheetFlowEvents["sheetAdded"] = (name) => {
      for (const id of Object.keys(this.placedAsts)) {
        const { data } = this.placedAsts[id];
        const { formula } = data;

        // TODO: that's kinda naive, figure out a better way to check if sheet/named expression is part of the ast
        if (formula.includes(name)) {
          this.updatePlacedAstWithFormula(id, formula);
        }
      }
    };

    // TODO: same thing but for named expressions
    const cellContentChanged: SheetFlowEvents["cellContentChanged"] = (
      address,
      content,
    ) => {
      for (const id of Object.keys(this.placedAsts)) {
        const placedAst = this.placedAsts[id];
        const { source } = placedAst;

        if (!isCellAddress(source) || !areCellAddressesEqual(address, source))
          continue;

        this.setPlacedAstContent(placedAst, content);
      }
    };

    this.on("valuesChanged", astValuesChangedListener);
    this.on("sheetAdded", sheetNamedExpressionAdded);
    this.on("namedExpressionAdded", sheetNamedExpressionAdded);
    this.on("cellContentChanged", cellContentChanged);
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
  abstract getAllSheets(includeInternalSheets?: boolean): Sheets;
  abstract getAllSheetNames(includeInternalSheets?: boolean): string[];
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
  abstract getAstFromAddress(address: CellAddress, id?: string): Ast;
  abstract getAstFromFormula(id: string, formula: string, scope?: number): Ast;

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
    const items = values.map((i) => i.astAddress.row).sort((a, b) => a - b);
    const empty = items.find((row, idx) => row !== idx);

    if (empty === undefined) return items.length + 1;
    return empty - 1;
  }

  getConfig(): Readonly<SheetFlowConfig> {
    return this.config;
  }

  updateConfig(config: Partial<SheetFlowConfig>): void {
    const regenerateFlows =
      config.flow &&
      !equal({ ...this.config.flow, ...config.flow }, this.config.flow);

    this.config = { ...this.config, ...config };
    this.eventEmitter.emit("configChanged", this.config);

    if (regenerateFlows) {
      for (const placedAst of Object.values(this.placedAsts)) {
        placedAst.updateFlowSettings(config.flow!);
      }
    }
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

  astToFormula(ast: Ast): string {
    return `=${ast.rawContent}`;
  }

  isAstPlaced(id: string): boolean {
    return id in this.placedAsts;
  }

  getPlacedAst(id: string): PlacedAst {
    if (!(id in this.placedAsts))
      throw new Error(`Placed AST with ID \`${id}\` not found`);

    return this.placedAsts[id];
  }

  createPlacedAst(source: PlacedAstSource): PlacedAst {
    const id = crypto.randomUUID();
    const row = this.getFirstAvailableRowForPlaceableAst();
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);
    const astAddress = buildCellAddress(0, row, sheetId);

    const placedAst = new PlacedAst(id, source, astAddress, this.config.flow);

    this.placedAsts[id] = placedAst;

    if (isCellAddress(source)) {
      this.setPlacedAstContent(placedAst, this.getCell(source));
    } else {
      // TODO: implement named expressions
      throw new Error("Named expressions not yet implemented");
    }

    return placedAst;
  }

  placeAst(id: string): void {
    const { astAddress, data } = this.getPlacedAst(id);
    const { row } = astAddress;
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);

    // TODO: instead of placing the main formula in the internal sheet (first item in `flatAst`)
    // reuse the source cell instead when checking for changes (possibly make a helper in PlacedAst)
    data.flatAst.forEach((ast, idx) => {
      const address = buildCellAddress(idx, row, sheetId);
      this.setCell(address, this.astToFormula(ast));
    });
  }

  removePlacedAst(id: string): void {
    const placedAst = this.getPlacedAst(id);
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);

    this.clearRow(sheetId, placedAst.astAddress.row);
    delete this.placedAsts[id];
  }

  calculatePlacedAst(id: string): Value[] {
    const { data } = this.getPlacedAst(id);

    return data.flatAst.map((ast) =>
      isEmptyAst(ast)
        ? buildEmptyCellValue({ value: null })
        : this.calculateFormula(
            this.astToFormula(ast),
            this.getSheetIdWithError(SpecialSheets.PLACED_ASTS),
          ),
    );
  }

  calculatePlacedAstAsRecord(id: string): Record<string, Value> {
    const { data } = this.getPlacedAst(id);
    const values = this.calculatePlacedAst(id);
    const groupedValues: Record<string, Value> = {};

    data.flatAst.forEach((ast, idx) => {
      groupedValues[ast.id] = values[idx];
    });

    return groupedValues;
  }

  setPlacedAstContent(placedAst: PlacedAst, content: CellContent): PlacedAst {
    const { id, astAddress, source } = placedAst;

    // TODO: simplify this
    if (content === undefined || content === null || content === "") {
      placedAst.updateData(PlacedAst.buildEmptyData());
      void placedAst.generateFlow();
      this.clearRow(astAddress.sheet, astAddress.row);
      return placedAst;
    }

    // TODO: handle this better
    const formula =
      typeof content !== "string" || !this.isFormulaValid(content)
        ? `=${(content ?? "").toString()}`
        : content;

    // TODO: support named expressions
    if (!isCellAddress(source)) throw new Error("Implement named expressions");

    const ast = this.getAstFromFormula(
      crypto.randomUUID(),
      formula,
      source.sheet,
    );
    const flatAst = flattenAst(ast);
    const missing = getMissingSheetsAndNamedExpressions(this, flatAst);
    const precedents = getPrecedents(this, flatAst);

    placedAst.updateData({ formula, ast, flatAst, precedents, missing });
    void placedAst.generateFlow();

    this.pauseEvaluation();
    this.clearRow(astAddress.sheet, astAddress.row);
    this.placeAst(id);
    this.resumeEvaluation();

    return placedAst;
  }

  updatePlacedAstWithFormula(id: string, formula: string): void {
    if (!this.isFormulaValid(formula))
      throw new Error(`Formula \`${formula}\` is not a valid formula`);

    const { source } = this.getPlacedAst(id);
    const normalizedFormula = this.normalizeFormula(formula);

    if (isCellAddress(source)) {
      this.setCell(source, normalizedFormula);
    } else {
      this.setNamedExpression(source.name, normalizedFormula, source.scope);
    }
  }

  isPlacedAstPartOfChanges(id: string, changes: Change[]): boolean {
    const { astAddress } = this.getPlacedAst(id);
    const sheetId = this.getSheetIdWithError(SpecialSheets.PLACED_ASTS);

    return !!changes.find((change) => {
      if ("address" in change) {
        const { sheet, row } = change.address;
        return sheet === sheetId && row === astAddress.row;
      }

      return false;
    });
  }

  recalculateEverything(): void {
    for (const id of Object.keys(this.placedAsts)) {
      const { formula } = this.placedAsts[id].data;
      this.updatePlacedAstWithFormula(id, formula);
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

// go home ESLint, you're drunk
/* eslint-disable react/no-is-mounted */
import { remapAst, remapSheet, remapSheets } from "@/libs/hyperformula";
import {
  Ast,
  CellAddress,
  CellContent,
  CellRange,
  Change,
  EngineEventEmitter,
  Events,
  NamedExpressions,
  SheetFlow,
  Sheets,
  Value,
} from "@/libs/sheetflow";
import { SpecialSheets } from "@/libs/sheetflow/utils";
import EventEmitter from "events";
import {
  CellValue,
  ConfigParams,
  ExportedCellChange,
  ExportedChange,
  HyperFormula,
  NoRelativeAddressesAllowedError,
  SerializedNamedExpression,
} from "hyperformula";
import * as Languages from "hyperformula/es/i18n/languages";
import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";
import { Listeners } from "hyperformula/typings/Emitter";
import {
  remapCellAddress,
  remapCellRange,
  unmapCellAddress,
  unmapCellRange,
} from "./remapCellAddress";
import {
  getCellValueDetails,
  remapCellValue,
  remapDetailedCellValue,
} from "./remapCellValue";
import {
  remapNamedExpression,
  unmapNamedExpression,
} from "./remapNamedExpression";
import { areHfAddressesEqual, getSheetIdWithError } from "./utils";

export const registerAllLanguages = () => {
  const langs = HyperFormula.getRegisteredLanguagesCodes();

  for (const [lang, pack] of Object.entries(Languages).filter(
    ([lang]) => !langs.includes(lang)
  )) {
    HyperFormula.registerLanguage(lang, pack);
  }
};

registerAllLanguages();

export type HyperFormulaConfig = Partial<ConfigParams>;

type RemapEvents<T extends keyof Events> = T extends "valuesChanged"
  ? "valuesUpdated"
  : never;
type EventListeners<T extends keyof Events = keyof Events> = Record<
  T,
  Map<Events[T], Listeners[RemapEvents<T>]>
>;

export class HyperFormulaEngine extends SheetFlow {
  protected hf: HyperFormula;
  protected eventEmitter: EngineEventEmitter;
  protected eventListeners: EventListeners;

  static build(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: HyperFormulaConfig
  ) {
    return new HyperFormulaEngine(sheets, namedExpressions, config);
  }

  constructor(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: HyperFormulaConfig
  ) {
    super();

    const _sheets = { ...sheets, [SpecialSheets.FORMULAS]: [] };

    this.hf = HyperFormula.buildFromSheets(_sheets, config);

    if (namedExpressions) {
      for (const namedExpression of namedExpressions) {
        const { name, expression, scope } = unmapNamedExpression(
          this.hf,
          namedExpression
        );
        this.hf.addNamedExpression(name, expression, scope);
      }
    }

    this.eventEmitter = new EventEmitter() as EngineEventEmitter;
    this.eventListeners = { valuesChanged: new Map() };

    // TODO: remove
    // @ts-expect-error make HF instance available in browser's console
    window.hf = this.hf;
  }

  stringToCellAddress(address: string, sheetName?: string) {
    const [colRow, sheet] = address.split("!").reverse();
    const sheetId = getSheetIdWithError(this.hf, sheet ?? sheetName);

    const hfAddress = this.hf.simpleCellAddressFromString(colRow, sheetId);
    if (!hfAddress) throw new Error();

    return remapCellAddress(this.hf, hfAddress);
  }

  stringToCellRange(range: string, sheetName?: string) {
    const [relRange, sheet] = range.split("!").reverse();
    const sheetId = getSheetIdWithError(this.hf, sheet ?? sheetName);

    const hfRange = this.hf.simpleCellRangeFromString(relRange, sheetId);
    if (!hfRange) throw new Error();

    return remapCellRange(this.hf, hfRange);
  }

  cellAddressToString(address: CellAddress) {
    const addr = unmapCellAddress(this.hf, address);

    // -1 so string address always contains sheet name
    const string = this.hf.simpleCellAddressToString(addr, -1);

    if (!string)
      throw new Error(
        `Failed to convert address \`${JSON.stringify(addr)}\` to string`
      );

    return string;
  }

  cellRangeToString(range: CellRange) {
    const hfRange = unmapCellRange(this.hf, range);

    // -1 so string address always contains sheet name
    const string = this.hf.simpleCellRangeToString(hfRange, -1);

    if (!string)
      throw new Error(
        `Failed to convert address \`${JSON.stringify(hfRange)}\` to string`
      );

    return string;
  }

  getCellValue(address: CellAddress) {
    return remapDetailedCellValue(
      getCellValueDetails(this.hf, unmapCellAddress(this.hf, address))
    );
  }

  getArrayCellValue(address: CellAddress) {
    // HyperFormula doesn't have an easy way of extracting value of a cell when that cell contains:
    // - a cell range - returns `Cell range not allowed.` error
    // - an inline array - returns only first value in the array, would require manually extracting value from every cell
    // so instead we just convert contents of that cell into a formula, because that works for some reason...

    const addr = unmapCellAddress(this.hf, address);
    const contents = this.hf.getCellSerialized(addr);
    let value: CellValue | CellValue[][];

    // TODO: add safeguards
    if (typeof contents === "string" && this.hf.validateFormula(contents)) {
      value = this.hf.calculateFormula(contents, addr.sheet);
    } else {
      value = this.hf.calculateFormula(`=${contents}`, addr.sheet);
    }

    return remapCellValue(value);
  }

  getCell(address: CellAddress) {
    // TODO: remap
    return this.hf.getCellSerialized(unmapCellAddress(this.hf, address));
  }

  setCell(address: CellAddress, content: CellContent) {
    this.hf.setCellContents(unmapCellAddress(this.hf, address), content);
  }

  addSheet(name: string, content?: CellContent[][]) {
    this.hf.addSheet(name);

    if (content) this.setSheet(name, content);
  }

  removeSheet(name: string) {
    const sheetId = getSheetIdWithError(this.hf, name);
    this.hf.removeSheet(sheetId);
  }

  renameSheet(name: string, newName: string): void {
    const sheetId = getSheetIdWithError(this.hf, name);
    this.hf.renameSheet(sheetId, newName);
  }

  getSheet(name: string) {
    const sheetId = getSheetIdWithError(this.hf, name);
    return remapSheet(this.hf.getSheetSerialized(sheetId));
  }

  setSheet(name: string, content: CellContent[][]) {
    const sheetId = getSheetIdWithError(this.hf, name);
    this.hf.setSheetContent(sheetId, content);
  }

  doesSheetExists(name: string) {
    return this.hf.doesSheetExist(name);
  }

  getAllSheets() {
    return remapSheets(this.hf.getAllSheetsSerialized());
  }

  getAllSheetNames() {
    return this.hf.getSheetNames();
  }

  clearRow(sheet: string, index: number): void {
    const sheetId = getSheetIdWithError(this.hf, sheet);
    this.hf.removeRows(sheetId, [index, 1]);
    this.hf.addRows(sheetId, [index, 1]);
  }

  getNamedExpressions() {
    return this.hf
      .getAllNamedExpressionsSerialized()
      .map((i) => remapNamedExpression(this.hf, i));
  }

  getNamedExpression(name: string, scope?: string) {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    // `getNamedExpression` provided by HyperFormula won't return named formula's expression if it's not a formula, so we need to extract it ourselves
    // based on `getAllNamedExpressionsSerialized` https://github.com/handsontable/hyperformula/blob/master/src/Serialization.ts#L140

    const namedExpression =
      this.hf.dependencyGraph.namedExpressions.namedExpressionForScope(
        name,
        sheetId
      );

    if (!namedExpression)
      throw new Error(
        `Named expression \`${name}\` (scope \`${scope}\`) doesn't exists`
      );

    const serialized: SerializedNamedExpression = {
      name,
      expression: this.hf.getCellSerialized(namedExpression.address),
      options: namedExpression.options,
      scope: sheetId,
    };

    return remapNamedExpression(this.hf, serialized);
  }

  setNamedExpression(name: string, content: CellContent, scope?: string) {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    try {
      if (!this.hf.listNamedExpressions().includes(name)) {
        this.hf.addNamedExpression(name, content, sheetId);
      } else {
        this.hf.changeNamedExpression(name, content, sheetId);
      }
    } catch (e) {
      if (e instanceof NoRelativeAddressesAllowedError) {
        // TODO: add info about absolute addresses not supported
        console.warn("Relative addresses not allowed in named expression");
      } else throw e;
    }
  }

  removeNamedExpression(name: string, scope?: string) {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    this.hf.removeNamedExpression(name, sheetId);
  }

  getNamedExpressionValue(name: string, scope?: string) {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    const val = this.hf.getNamedExpressionValue(name, sheetId);
    if (val === undefined) throw new Error();

    return remapCellValue(val);
  }

  doesNamedExpressionExists(name: string, scope?: string): boolean {
    let exists = false;

    try {
      exists = !!this.getNamedExpression(name, scope);
    } catch (e) {
      exists = false;
    }

    return exists;
  }

  isFormulaValid(formula: string) {
    return this.hf.validateFormula(formula);
  }

  normalizeFormula(formula: string) {
    return this.hf.normalizeFormula(formula);
  }

  getAst(address: CellAddress, uuid: string = crypto.randomUUID()) {
    const addr = unmapCellAddress(this.hf, address);

    const formulaVertex = this.hf.graph.getNodes().find((node) => {
      if ("formula" in node && "cellAddress" in node) {
        // @ts-expect-error we're using protected property here
        const cellAddress = node.cellAddress;
        return areHfAddressesEqual(cellAddress, addr);
      }
    }) as FormulaVertex | undefined;

    // @ts-expect-error we're using protected property here
    const hfAst = formulaVertex?.formula;

    if (!hfAst) {
      throw new Error(
        `Failed to retrieve AST from cell \`${this.cellAddressToString(
          address
        )}\``
      );
    }

    return remapAst(this.hf, hfAst, addr, uuid);
  }

  astToFormula(ast: Ast): string {
    // every language supported by HyperFormula doesn't translate `ARRAYFORMULA` function name, so this should theoretically always work
    return ast.isArrayFormula
      ? `=ARRAYFORMULA(${ast.rawContent})`
      : `=${ast.rawContent}`;
  }

  calculateFormula(formula: string, sheet: string): Value {
    const sheetId = getSheetIdWithError(this.hf, sheet);
    return remapCellValue(this.hf.calculateFormula(formula, sheetId));
  }

  pauseEvaluation() {
    this.hf.suspendEvaluation();
  }

  resumeEvaluation() {
    this.hf.resumeEvaluation();
  }

  on = <T extends keyof Events>(event: T, listener: Events[T]) => {
    if (event === "valuesChanged") {
      const wrappedListener: Listeners["valuesUpdated"] = (changes) => {
        const list: Change[] = [];

        listener(this.remapChanges(changes));
      };

      this.eventListeners[event].set(listener, wrappedListener);

      this.hf.on("valuesUpdated", wrappedListener);
    }

    return this.eventEmitter;
  };

  off = <T extends keyof Events>(event: T, listener: Events[T]) => {
    if (event === "valuesChanged") {
      const wrappedListener = this.eventListeners[event].get(listener);
      if (!wrappedListener) throw new Error();

      this.hf.off("valuesUpdated", wrappedListener);
    }

    return this.eventEmitter;
  };

  protected remapChange(change: ExportedChange): Change {
    if (change instanceof ExportedCellChange) {
      const address = remapCellAddress(this.hf, change.address);

      return {
        address,
        value: this.getCellValue(address),
      };
    } else {
      return {
        name: change.name,
        value: remapCellValue(change.newValue),
      };
    }
  }

  protected remapChanges(changes: ExportedChange[]) {
    return changes.map((change) => this.remapChange(change));
  }
}

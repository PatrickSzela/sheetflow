// go home ESLint, you're drunk
/* eslint-disable react/no-is-mounted */
import { remapAst, remapSheet, remapSheets } from "@/libs/hyperformula";
import {
  CellAddress,
  CellContent,
  Change,
  EngineEventEmitter,
  Events,
  SheetFlow,
  Sheets,
} from "@/libs/sheetflow";
import EventEmitter from "events";
import {
  ConfigParams,
  ExportedCellChange,
  ExportedChange,
  HyperFormula,
} from "hyperformula";
import * as Languages from "hyperformula/es/i18n/languages";
import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";
import { Listeners } from "hyperformula/typings/Emitter";
import {
  remapCellAddress,
  remapCellRange,
  unmapCellAddress,
} from "./remapCellAddress";
import { getCellValueDetails, remapCellValue } from "./remapCellValue";
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

  static build(sheets?: Sheets, config?: HyperFormulaConfig) {
    return new HyperFormulaEngine(sheets, config);
  }

  constructor(sheets?: Sheets, config?: HyperFormulaConfig) {
    super();

    this.hf = HyperFormula.buildFromSheets(sheets ?? {}, config);
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

  getCellValue(address: CellAddress) {
    return remapCellValue(
      getCellValueDetails(this.hf, unmapCellAddress(this.hf, address))
    );
  }

  getArrayCellValue(address: CellAddress) {
    const addr = unmapCellAddress(this.hf, address);

    if (this.hf.isCellPartOfArray(addr)) {
      const arrayVertex = this.hf.arrayMapping.getArrayByCorner(addr);

      if (!arrayVertex) {
        throw new Error(
          `Unable to retrieve array from cell \`${this.cellAddressToString(
            address
          )}\``
        );
      }

      const { width, height } = arrayVertex;

      const arr = Array(height)
        .fill(null)
        .map(() => Array(width).fill(null));

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          arr[row][col] = remapCellValue(
            getCellValueDetails(this.hf, { col, row, sheet: addr.sheet })
          );
        }
      }

      return arr;
    } else {
      return [[this.getCellValue(address)]];
    }
  }

  getCell(address: CellAddress) {
    // TODO: remap
    return this.hf.getCellSerialized(unmapCellAddress(this.hf, address));
  }

  setCell(address: CellAddress, content: CellContent) {
    this.hf.setCellContents(unmapCellAddress(this.hf, address), content);
  }

  getCellPrecedents(address: CellAddress) {
    return this.hf
      .getCellPrecedents(unmapCellAddress(this.hf, address))
      .map((i) =>
        "start" in i ? remapCellRange(this.hf, i) : remapCellAddress(this.hf, i)
      );
  }

  addSheet(name: string, content?: CellContent[][]) {
    this.hf.addSheet(name);

    if (content) this.setSheet(name, content);
  }

  removeSheet(name: string) {
    const sheetId = getSheetIdWithError(this.hf, name);
    this.hf.removeSheet(sheetId);
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

  protected remapChange(change: ExportedChange) {
    if (change instanceof ExportedCellChange) {
      const address = remapCellAddress(this.hf, change.address);

      return {
        address,
        value: this.getCellValue(address),
      };
    } else {
      // TODO: support named expressions
      throw new Error("Named expressions aren't (yet) supported");
    }
  }

  protected remapChanges(changes: ExportedChange[]) {
    return changes.map((change) => this.remapChange(change));
  }
}

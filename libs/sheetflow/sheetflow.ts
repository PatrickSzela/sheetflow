import TypedEmitter from "typed-emitter";
import { Ast, isEmptyAst } from "./ast";
import { CellContent } from "./cell";
import { buildCellAddress, CellAddress } from "./cellAddress";
import { CellRange } from "./cellRange";
import { buildEmptyCellValue, CellValue, Value } from "./cellValue";
import { Change } from "./change";
import { flattenAst } from "./flattenAst";
import { NamedExpression, NamedExpressions } from "./namedExpression";
import { PlacedAst } from "./placedAst";
import { Reference } from "./reference";
import { Sheet, Sheets } from "./sheet";
import {
  getMissingSheetsAndNamedExpressions,
  getPrecedents,
  SpecialSheets,
} from "./utils";

export type Events = {
  // TODO: removed sheet & named expression
  sheetAdded: (sheet: string) => void;
  namedExpressionAdded: (sheet: string) => void;
  valuesChanged: (changes: Change[]) => void;
};
export type EngineEventEmitter = TypedEmitter<Events>;

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
  protected placedAsts: Record<string, PlacedAst> = {};

  constructor() {
    // TODO: remove
    // @ts-expect-error make HF instance available in browser's console
    window.engine = this;
  }

  registerEvents() {
    const astValuesChangedListener: Events["valuesChanged"] = (changes) => {
      for (const uuid of Object.keys(this.placedAsts)) {
        if (this.isPlacedAstPartOfChanges(uuid, changes)) {
          this.placedAsts[uuid].updateValues(
            this.calculatePlacedAstAsRecord(uuid)
          );
        }
      }
    };

    const sheetNamedExpressionAdded: Events["sheetAdded"] = (name) => {
      for (const uuid of Object.keys(this.placedAsts)) {
        const placedAst = this.placedAsts[uuid];

        // TODO: that's kinda naive, figure out a better way to check if sheet/named expression is part of the ast
        if (placedAst.formula.includes(name)) {
          placedAst.updateAst(
            placedAst.formula,
            placedAst.ast,
            placedAst.flatAst,
            getPrecedents(this, placedAst.flatAst),
            getMissingSheetsAndNamedExpressions(this, placedAst.flatAst)
          );
        }
      }
    };

    this.on("valuesChanged", astValuesChangedListener);
    this.on("sheetAdded", sheetNamedExpressionAdded);
    this.on("namedExpressionAdded", sheetNamedExpressionAdded);
  }

  static build(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: any
  ): SheetFlow {
    throw new Error("Called `build` function on an abstract class");
  }

  // #region abstract methods
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
  abstract getSheet(name: string): Sheet;
  abstract setSheet(name: string, content: Sheet): void;
  abstract addSheet(name: string, content?: Sheet): void;
  abstract renameSheet(name: string, newName: string): void;
  abstract removeSheet(name: string): void;
  abstract doesSheetExists(name: string): boolean;
  abstract getAllSheets(): Sheets;
  abstract getAllSheetNames(): string[];
  abstract clearRow(sheet: string, index: number): void;

  // named expression
  abstract getNamedExpression(name: string, scope?: string): NamedExpression;
  abstract setNamedExpression(
    name: string,
    content: CellContent,
    scope?: string
  ): void;
  abstract addNamedExpression(
    name: string,
    content?: CellContent,
    scope?: string
  ): void;
  abstract removeNamedExpression(name: string, scope?: string): void;
  abstract doesNamedExpressionExists(name: string, scope?: string): boolean;
  abstract getNamedExpressionValue(name: string, scope?: string): Value;
  abstract getAllNamedExpressions(): NamedExpressions;

  // formula
  abstract isFormulaValid(formula: string): boolean;
  abstract normalizeFormula(formula: string): string;
  abstract calculateFormula(formula: string, sheet: string): Value;

  // formula AST
  abstract getAstFromAddress(address: CellAddress, uuid?: string): Ast;
  abstract getAstFromFormula(uuid: string, formula: string, scope: string): Ast;
  abstract astToFormula(ast: Ast): string;

  // evaluation
  abstract pauseEvaluation(): void;
  abstract resumeEvaluation(): void;

  // event
  abstract on: EngineEventEmitter["on"];
  abstract off: EngineEventEmitter["off"];
  // #endregion

  protected getFirstAvailableRowForPlaceableAst(): number {
    const values = Object.values(this.placedAsts);
    if (!values.length) return 0;

    // while this will break if there are duplicates in the array or if the number isn't an integer, but this should never happen
    const items = values.map((i) => i.address.row).sort((a, b) => a - b);
    const empty = items.find((row, idx) => row !== idx);

    if (empty === undefined) return items.length + 1;
    return empty - 1;
  }

  isAstPlaced(uuid: string): boolean {
    return uuid in this.placedAsts;
  }

  getPlacedAst(uuid: string): PlacedAst {
    if (!(uuid in this.placedAsts))
      throw new Error(`UUID \`${uuid}\` not found`);

    return this.placedAsts[uuid];
  }

  createPlacedAst(): PlacedAst {
    const uuid = crypto.randomUUID();
    const row = this.getFirstAvailableRowForPlaceableAst();
    const address = buildCellAddress(0, row, SpecialSheets.PLACED_ASTS);

    const placedAst = new PlacedAst(uuid, address);
    this.placedAsts[uuid] = placedAst;

    return placedAst;
  }

  placeAst(uuid: string): void {
    const { address, flatAst } = this.getPlacedAst(uuid);
    const { row } = address;

    flatAst.forEach((ast, idx) => {
      const address = buildCellAddress(idx, row, SpecialSheets.PLACED_ASTS);
      this.setCell(address, this.astToFormula(ast));
    });
  }

  removePlacedAst(uuid: string): void {
    const placedAst = this.getPlacedAst(uuid);
    this.clearRow(SpecialSheets.PLACED_ASTS, placedAst.address.row);
    delete this.placedAsts[uuid];
  }

  calculatePlacedAst(uuid: string): Value[] {
    const { flatAst } = this.getPlacedAst(uuid);

    return flatAst.map((ast) =>
      isEmptyAst(ast)
        ? buildEmptyCellValue({ value: null })
        : this.calculateFormula(
            this.astToFormula(ast),
            SpecialSheets.PLACED_ASTS
          )
    );
  }

  calculatePlacedAstAsRecord(uuid: string): Record<string, Value> {
    const { flatAst } = this.getPlacedAst(uuid);
    const values = this.calculatePlacedAst(uuid);
    const groupedValues: Record<string, Value> = {};

    flatAst.forEach((ast, idx) => {
      groupedValues[ast.id] = values[idx];
    });

    return groupedValues;
  }

  placeAstFromFormula(uuid: string, formula: string, scope: string): PlacedAst {
    if (!this.isFormulaValid(formula))
      throw new Error(`Formula \`${formula}\` is not a valid formula`);

    this.pauseEvaluation();

    const placedAst = this.getPlacedAst(uuid);
    const normalizedFormula = this.normalizeFormula(formula);
    const { address } = placedAst;

    const ast = this.getAstFromFormula(
      crypto.randomUUID(),
      normalizedFormula,
      scope
    );
    const flatAst = flattenAst(ast);
    const missing = getMissingSheetsAndNamedExpressions(this, flatAst);
    const precedents = getPrecedents(this, flatAst);

    placedAst.updateAst(formula, ast, flatAst, precedents, missing);

    this.clearRow(address.sheet, address.row);
    this.placeAst(uuid);

    this.resumeEvaluation();

    return placedAst;
  }

  isPlacedAstPartOfChanges(uuid: string, changes: Change[]): boolean {
    const { address } = this.getPlacedAst(uuid);

    return !!changes.find((change) => {
      if ("address" in change) {
        return (
          change.address.sheet === SpecialSheets.PLACED_ASTS &&
          change.address.row === address.row
        );
      }

      return false;
    });
  }

  getNonEmptyCellsFromSheet(sheetName: string): Reference[] {
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

  getAllNonEmptyCells(): Reference[] {
    let list: Reference[] = [];

    for (const sheetName of this.getAllSheetNames()) {
      list = [...list, ...this.getNonEmptyCellsFromSheet(sheetName)];
    }

    return list;
  }
}

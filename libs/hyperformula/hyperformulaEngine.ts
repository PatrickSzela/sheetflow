import {
  Ast,
  buildCellAddress,
  CellAddress,
  CellContent,
  CellRange,
  CellValue,
  extractDataFromStringAddress,
  NamedExpression,
  NamedExpressions,
  Sheet,
  SheetFlow,
  Sheets,
  SpecialSheets,
  Value,
} from "@/libs/sheetflow";
import {
  ConfigParams,
  CellValue as HfCellValue,
  HyperFormula,
  NoRelativeAddressesAllowedError,
  SerializedNamedExpression,
} from "hyperformula";
import { FormulaVertex } from "hyperformula/es/DependencyGraph/FormulaCellVertex";
import { ParsingResult } from "hyperformula/typings/parser/ParserWithCaching";
import { ensureReferencesInAstHaveSheetNames, remapAst } from "./remapAst";
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
import { remapChanges } from "./remapChange";
import {
  remapNamedExpression,
  unmapNamedExpression,
} from "./remapNamedExpression";
import { remapSheet, remapSheets } from "./remapSheet";
import {
  areHfAddressesEqual,
  getSheetIdWithError,
  registerAllLanguages,
} from "./utils";

registerAllLanguages();

export type HyperFormulaConfig = Partial<ConfigParams>;

export class HyperFormulaEngine extends SheetFlow {
  protected hf: HyperFormula;

  static build(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: HyperFormulaConfig
  ) {
    const engine = new HyperFormulaEngine(sheets, namedExpressions, config);
    engine.registerEvents();
    return engine;
  }

  registerEvents(): void {
    super.registerEvents();

    this.hf.on("namedExpressionAdded", (namedExpression) => {
      this.eventEmitter.emit("namedExpressionAdded", namedExpression);
    });

    this.hf.on("sheetAdded", (sheet) => {
      this.eventEmitter.emit("sheetAdded", sheet);
    });

    this.hf.on("valuesUpdated", (changes) => {
      this.eventEmitter.emit(
        "valuesChanged",
        remapChanges(this, this.hf, changes)
      );
    });
  }

  constructor(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: HyperFormulaConfig
  ) {
    super();

    this.hf = HyperFormula.buildFromSheets(
      { ...sheets, [SpecialSheets.PLACED_ASTS]: [] },
      config
    );

    if (namedExpressions) {
      for (const namedExpression of namedExpressions) {
        const { name, expression, scope } = unmapNamedExpression(
          this.hf,
          namedExpression
        );
        this.hf.addNamedExpression(name, expression, scope);
      }
    }

    // TODO: remove
    // @ts-expect-error make HF instance available in browser's console
    window.hf = this.hf;
  }

  // #region conversion
  stringToCellAddress(address: string, sheetName?: string): CellAddress {
    const { position, sheet } = extractDataFromStringAddress(address);
    const sheetId = getSheetIdWithError(this.hf, sheet ?? sheetName);

    const hfAddress = this.hf.simpleCellAddressFromString(position, sheetId);
    if (!hfAddress) throw new Error();

    return remapCellAddress(this.hf, hfAddress);
  }

  stringToCellRange(range: string, sheetName?: string): CellRange {
    // TODO: replace with splitStringRange
    const { position, sheet } = extractDataFromStringAddress(range);
    const sheetId = getSheetIdWithError(this.hf, sheet ?? sheetName);

    const hfRange = this.hf.simpleCellRangeFromString(position, sheetId);
    if (!hfRange) throw new Error();

    return remapCellRange(this.hf, hfRange);
  }

  cellAddressToString(address: CellAddress): string {
    const addr = unmapCellAddress(this.hf, address);

    // -1 so string address always contains sheet name
    const string = this.hf.simpleCellAddressToString(addr, -1);

    if (!string)
      throw new Error(
        `Failed to convert address \`${JSON.stringify(addr)}\` to string`
      );

    return string;
  }

  cellRangeToString(range: CellRange): string {
    const hfRange = unmapCellRange(this.hf, range);

    // -1 so string address always contains sheet name
    const string = this.hf.simpleCellRangeToString(hfRange, -1);

    if (!string)
      throw new Error(
        `Failed to convert address \`${JSON.stringify(hfRange)}\` to string`
      );

    return string;
  }
  // #endregion

  // #region cell
  getCell(address: CellAddress): CellContent {
    // TODO: remap
    return this.hf.getCellSerialized(unmapCellAddress(this.hf, address));
  }

  setCell(address: CellAddress, content: CellContent): void {
    this.hf.setCellContents(unmapCellAddress(this.hf, address), content);
  }

  getCellValue(address: CellAddress): CellValue {
    return remapDetailedCellValue(
      getCellValueDetails(this.hf, unmapCellAddress(this.hf, address))
    );
  }

  getArrayCellValue(address: CellAddress): Value {
    // HyperFormula doesn't have an easy way of extracting value of a cell when that cell contains:
    // - a cell range - returns `Cell range not allowed.` error
    // - an inline array - returns only first value in the array, would require manually extracting value from every cell
    // so instead we just convert contents of that cell into a formula, because that works for some reason...

    const addr = unmapCellAddress(this.hf, address);
    const contents = this.hf.getCellSerialized(addr);
    let value: HfCellValue | HfCellValue[][];

    // TODO: add safeguards
    if (typeof contents === "string" && this.hf.validateFormula(contents)) {
      value = this.hf.calculateFormula(contents, addr.sheet);
    } else {
      value = this.hf.calculateFormula(`=${contents}`, addr.sheet);
    }

    return remapCellValue(value);
  }
  // #endregion

  // #region sheet
  getSheet(name: string): Sheet {
    const sheetId = getSheetIdWithError(this.hf, name);
    return remapSheet(this.hf.getSheetSerialized(sheetId));
  }

  setSheet(name: string, content: CellContent[][]): void {
    const sheetId = getSheetIdWithError(this.hf, name);
    this.hf.setSheetContent(sheetId, content);
  }

  addSheet(name: string, content?: CellContent[][]): void {
    this.hf.addSheet(name);
    if (content) this.setSheet(name, content);
  }

  renameSheet(name: string, newName: string): void {
    const sheetId = getSheetIdWithError(this.hf, name);
    this.hf.renameSheet(sheetId, newName);
  }

  removeSheet(name: string): void {
    const sheetId = getSheetIdWithError(this.hf, name);
    this.hf.removeSheet(sheetId);
  }

  doesSheetExists(name: string): boolean {
    return this.hf.doesSheetExist(name);
  }

  getAllSheets(): Sheets {
    return remapSheets(this.hf.getAllSheetsSerialized());
  }

  getAllSheetNames(): string[] {
    return this.hf.getSheetNames();
  }

  clearRow(sheet: string, index: number): void {
    const sheetId = getSheetIdWithError(this.hf, sheet);
    this.hf.removeRows(sheetId, [index, 1]);
    this.hf.addRows(sheetId, [index, 1]);
  }
  // #endregion

  // #region named expression
  getNamedExpression(name: string, scope?: string): NamedExpression {
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

  setNamedExpression(name: string, content: CellContent, scope?: string): void {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    try {
      this.hf.changeNamedExpression(name, content, sheetId);
    } catch (e) {
      if (e instanceof NoRelativeAddressesAllowedError) {
        // TODO: add info about absolute addresses not supported
        console.warn("Relative addresses not allowed in named expression");
      } else throw e;
    }
  }

  addNamedExpression(
    name: string,
    content?: CellContent,
    scope?: string
  ): void {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    this.hf.addNamedExpression(name, content, sheetId);
  }

  removeNamedExpression(name: string, scope?: string): void {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    this.hf.removeNamedExpression(name, sheetId);
  }

  doesNamedExpressionExists(name: string, scope?: string): boolean {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    return this.hf.listNamedExpressions(sheetId).includes(name);
  }

  getNamedExpressionValue(name: string, scope?: string): Value {
    const sheetId =
      scope !== undefined ? getSheetIdWithError(this.hf, scope) : undefined;

    const val = this.hf.getNamedExpressionValue(name, sheetId);
    if (val === undefined) throw new Error();

    return remapCellValue(val);
  }

  getAllNamedExpressions(): NamedExpressions {
    return this.hf
      .getAllNamedExpressionsSerialized()
      .map((i) => remapNamedExpression(this.hf, i));
  }
  // #endregion

  // #region formula
  isFormulaValid(formula: string): boolean {
    return this.hf.validateFormula(formula);
  }

  normalizeFormula(formula: string): string {
    return this.hf.normalizeFormula(formula);
  }

  calculateFormula(formula: string, sheet: string): Value {
    const sheetId = getSheetIdWithError(this.hf, sheet);
    return remapCellValue(this.hf.calculateFormula(formula, sheetId));
  }
  // #endregion

  // #region formula AST
  getAstFromAddress(address: CellAddress, uuid: string): Ast {
    const addr = unmapCellAddress(this.hf, address);

    const formulaVertex = this.hf.graph.getNodes().find((node) => {
      if (node instanceof FormulaVertex) {
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

  getAstFromFormula(uuid: string, formula: string, scope: string): Ast {
    const address = buildCellAddress(-1, -1, scope);
    const hfAddress = unmapCellAddress(this.hf, address);

    // @ts-expect-error we're using private property here
    const { ast } = this.hf._parser.parse(formula, hfAddress) as ParsingResult;
    const astWithSheetNames = ensureReferencesInAstHaveSheetNames(
      ast,
      hfAddress
    );

    return remapAst(this.hf, astWithSheetNames, hfAddress, uuid);
  }

  astToFormula(ast: Ast): string {
    // every language supported by HyperFormula doesn't translate `ARRAYFORMULA` function name, so this should theoretically always work
    return ast.isArrayFormula
      ? `=ARRAYFORMULA(${ast.rawContent})`
      : `=${ast.rawContent}`;
  }
  // #endregion

  // #region evaluation
  pauseEvaluation(): void {
    this.hf.suspendEvaluation();
  }

  resumeEvaluation(): void {
    this.hf.resumeEvaluation();
  }
  // #endregion
}

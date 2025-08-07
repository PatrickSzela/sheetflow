import {
  HyperFormula,
  NoRelativeAddressesAllowedError,
  type ConfigParams,
  type CellValue as HfCellValue,
  type SerializedNamedExpression,
} from "hyperformula";
import * as Languages from "hyperformula/i18n/languages";
import {
  SheetFlowEngine,
  SpecialSheets,
  buildCellAddress,
  extractDataFromStringAddress,
  type Ast,
  type CellAddress,
  type CellContent,
  type CellRange,
  type CellValue,
  type NamedExpression,
  type NamedExpressions,
  type Sheet,
  type Sheets,
  type Value,
} from "@/libs/sheetflow";
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
  FormulaVertex,
  areHfAddressesEqual,
  enhancePrototype,
  registerAllLanguages,
} from "./utils";

registerAllLanguages();
enhancePrototype();

export type HyperFormulaConfig = Partial<ConfigParams>;

export class HyperFormulaEngine extends SheetFlowEngine {
  protected hf: HyperFormula;

  static override build(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: HyperFormulaConfig,
  ): HyperFormulaEngine {
    const engine = new HyperFormulaEngine(sheets, namedExpressions, config);
    engine.registerEvents();
    return engine;
  }

  constructor(
    sheets?: Sheets,
    namedExpressions?: NamedExpressions,
    config?: HyperFormulaConfig,
  ) {
    super();

    this.hf = HyperFormula.buildFromSheets(
      { ...sheets, [SpecialSheets.PLACED_ASTS]: [] },
      config,
    );

    if (namedExpressions) {
      for (const namedExpression of namedExpressions) {
        const { name, expression, scope } =
          unmapNamedExpression(namedExpression);
        this.hf.addNamedExpression(name, expression, scope);
      }
    }

    this.valueErrorTypes =
      Languages[
        this.hf.getConfig().language as keyof Omit<typeof Languages, "default">
      ].errors;
  }

  override registerEvents(): void {
    super.registerEvents();

    this.hf.on("namedExpressionAdded", (namedExpression) => {
      this.eventEmitter.emit("namedExpressionAdded", namedExpression);
    });

    this.hf.on("sheetAdded", (sheet) => {
      this.eventEmitter.emit("sheetAdded", sheet);
    });

    this.hf.on("valuesUpdated", (changes) => {
      this.eventEmitter.emit("valuesChanged", remapChanges(this, changes));
    });
  }

  // #region engine
  updateConfig(config: HyperFormulaConfig): void {
    this.hf.updateConfig(config);
  }
  // #endregion

  // #region conversion
  stringToCellAddress(address: string, sheetName?: string): CellAddress {
    const { position, sheet } = extractDataFromStringAddress(address);
    const sheetId = this.getSheetIdWithError(sheet ?? sheetName);

    const hfAddress = this.hf.simpleCellAddressFromString(position, sheetId);
    if (!hfAddress) throw new Error();

    return remapCellAddress(hfAddress);
  }

  stringToCellRange(range: string, sheetName?: string): CellRange {
    // TODO: replace with splitStringRange
    const { position, sheet } = extractDataFromStringAddress(range);
    const sheetId = this.getSheetIdWithError(sheet ?? sheetName);

    const hfRange = this.hf.simpleCellRangeFromString(position, sheetId);
    if (!hfRange) throw new Error();

    return remapCellRange(hfRange);
  }

  cellAddressToString(address: CellAddress): string {
    const addr = unmapCellAddress(address);

    // -1 so string address always contains sheet name
    const string = this.hf.simpleCellAddressToString(addr, -1);

    if (!string)
      throw new Error(
        `Failed to convert address \`${JSON.stringify(addr)}\` to string`,
      );

    return string;
  }

  cellRangeToString(range: CellRange): string {
    const hfRange = unmapCellRange(range);

    // -1 so string address always contains sheet name
    const string = this.hf.simpleCellRangeToString(hfRange, -1);

    if (!string)
      throw new Error(
        `Failed to convert address \`${JSON.stringify(hfRange)}\` to string`,
      );

    return string;
  }
  // #endregion

  // #region cell
  getCell(address: CellAddress): CellContent {
    // TODO: remap
    return this.hf.getCellSerialized(unmapCellAddress(address));
  }

  setCell(address: CellAddress, content: CellContent): void {
    this.hf.setCellContents(unmapCellAddress(address), content);
  }

  getCellValue(address: CellAddress): CellValue {
    return remapDetailedCellValue(
      getCellValueDetails(this.hf, unmapCellAddress(address)),
    );
  }

  getArrayCellValue(address: CellAddress): Value {
    // HyperFormula doesn't have an easy way of extracting value of a cell when that cell contains:
    // - a cell range - returns `Cell range not allowed.` error
    // - an inline array - returns only first value in the array, would require manually extracting value from every cell
    // so instead we just convert contents of that cell into a formula, because that works for some reason...

    const addr = unmapCellAddress(address);
    const contents = this.hf.getCellSerialized(addr);
    let value: HfCellValue | HfCellValue[][];

    // TODO: add safeguards
    if (typeof contents === "string") {
      if (this.hf.validateFormula(contents)) {
        value = this.hf.calculateFormula(contents, addr.sheet);
      } else {
        value = this.hf.calculateFormula(`=${contents}`, addr.sheet);
      }
    } else if (contents instanceof Date) {
      throw new Error("Date not supported");
    } else {
      value = contents ?? null;
    }

    return remapCellValue(value);
  }
  // #endregion

  // #region sheet
  getSheetId(name: string): number | undefined {
    return this.hf.getSheetId(name);
  }
  getSheetIdWithError(name: string): number {
    const sheetId = this.getSheetId(name);

    if (typeof sheetId === "undefined")
      throw new Error(`Missing sheet \`${name}\``);

    return sheetId;
  }

  getSheetName(sheetId: number): string | undefined {
    return this.hf.getSheetName(sheetId);
  }

  getSheetNameWithError(sheetId: number): string {
    const sheetName = this.hf.getSheetName(sheetId);

    if (typeof sheetName === "undefined")
      throw new Error(`Missing sheet with ID \`${sheetId}\``);

    return sheetName;
  }

  getSheet(sheetId: number): Sheet {
    return remapSheet(this.hf.getSheetSerialized(sheetId));
  }

  setSheet(sheetId: number, content: CellContent[][]): void {
    this.hf.setSheetContent(sheetId, content);
  }

  addSheet(name: string, content?: CellContent[][]): void {
    this.hf.addSheet(name);
    const sheetId = this.getSheetIdWithError(name);
    if (content) this.setSheet(sheetId, content);
  }

  renameSheet(sheetId: number, newName: string): void {
    this.hf.renameSheet(sheetId, newName);
  }

  removeSheet(sheetId: number): void {
    this.hf.removeSheet(sheetId);
  }

  doesSheetExists(name: string): boolean {
    return this.hf.doesSheetExist(name);
  }

  doesSheetWithIdExists(id: number): boolean {
    return !!this.hf.getSheetName(id);
  }

  getAllSheets(): Sheets {
    return remapSheets(this.hf.getAllSheetsSerialized());
  }

  getAllSheetNames(): string[] {
    return this.hf.getSheetNames();
  }

  clearRow(sheetId: number, index: number): void {
    this.hf.removeRows(sheetId, [index, 1]);
    this.hf.addRows(sheetId, [index, 1]);
  }
  // #endregion

  // #region named expression
  getNamedExpression(name: string, scope?: number): NamedExpression {
    // `getNamedExpression` provided by HyperFormula won't return named formula's expression if it's not a formula, so we need to extract it ourselves
    // based on `getAllNamedExpressionsSerialized` https://github.com/handsontable/hyperformula/blob/master/src/Serialization.ts#L140

    const namedExpression =
      this.hf.dependencyGraph.namedExpressions.namedExpressionForScope(
        name,
        scope,
      );

    if (!namedExpression)
      throw new Error(
        `Named expression \`${name}\` (scope \`${scope}\`) doesn't exists`,
      );

    const serialized: SerializedNamedExpression = {
      name,
      expression: this.hf.getCellSerialized(namedExpression.address),
      ...(namedExpression.options && { options: namedExpression.options }),
      ...(scope !== undefined && { scope }),
    };

    return remapNamedExpression(serialized);
  }

  setNamedExpression(name: string, content: CellContent, scope?: number): void {
    try {
      this.hf.changeNamedExpression(name, content, scope);
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
    scope?: number,
  ): void {
    this.hf.addNamedExpression(name, content, scope);
  }

  removeNamedExpression(name: string, scope?: number): void {
    this.hf.removeNamedExpression(name, scope);
  }

  doesNamedExpressionExists(name: string, scope?: number): boolean {
    return this.hf.listNamedExpressions(scope).includes(name);
  }

  getNamedExpressionValue(name: string, scope?: number): Value {
    const val = this.hf.getNamedExpressionValue(name, scope);
    if (val === undefined) throw new Error();

    return remapCellValue(val);
  }

  getAllNamedExpressions(): NamedExpressions {
    return this.hf.getAllNamedExpressionsSerialized().map(remapNamedExpression);
  }

  getAllNamedExpressionNames(): string[] {
    return this.hf.listNamedExpressions();
  }
  // #endregion

  // #region formula
  isFormulaValid(formula: string): boolean {
    return this.hf.validateFormula(formula);
  }

  normalizeFormula(formula: string): string {
    return this.hf.normalizeFormula(formula);
  }

  calculateFormula(formula: string, sheetId: number): Value {
    return remapCellValue(this.hf.calculateFormula(formula, sheetId));
  }
  // #endregion

  // #region formula AST
  getAstFromAddress(address: CellAddress, uuid: string): Ast {
    const addr = unmapCellAddress(address);

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
          address,
        )}\``,
      );
    }

    return remapAst(this.hf, hfAst, addr, uuid);
  }

  getAstFromFormula(uuid: string, formula: string, scope: number): Ast {
    const address = buildCellAddress(-1, -1, scope);
    const hfAddress = unmapCellAddress(address);

    const { ast } = this.hf.parser.parse(formula, hfAddress);
    const astWithSheetNames = ensureReferencesInAstHaveSheetNames(
      ast,
      hfAddress,
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

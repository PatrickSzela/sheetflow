import EventEmitter from "events";
import TypedEventEmitter from "typed-emitter";
import { Ast, buildEmptyAst } from "./ast";
import { CellAddress } from "./cellAddress";
import { Value } from "./cellValue";
import { flattenAst } from "./flattenAst";
import { Reference } from "./reference";

export type AstEvents = {
  valuesChanged: (values: Record<string, Value>) => void;
  updated: (data: {
    formula: string;
    scope: string;
    ast: Ast;
    flatAst: Ast[];
    precedents: Reference[];
    missing: Missing;
  }) => void;
};
export type AstEventEmitter = TypedEventEmitter<AstEvents>;

export type Missing = { sheets: string[]; namedExpressions: string[] };

// TODO: read-only properties

export class PlacedAst {
  uuid: string;
  address: CellAddress;
  formula: string;
  scope: string;
  ast: Ast;
  flatAst: Ast[];
  values: Record<string, Value>;
  precedents: Reference[];
  missing: Missing;

  protected eventEmitter: AstEventEmitter =
    new EventEmitter() as AstEventEmitter;

  constructor(
    uuid: string,
    address: CellAddress,
    formula: string = "",
    scope: string = "",
    ast: Ast = buildEmptyAst({ value: null, rawContent: formula }),
    flatAst: Ast[] = flattenAst(ast),
    values: Record<string, Value> = {},
    precedents: Reference[] = [],
    missing: Missing = { namedExpressions: [], sheets: [] }
  ) {
    this.uuid = uuid;
    this.address = address;
    this.formula = formula;
    this.scope = scope;
    this.ast = ast;
    this.flatAst = flatAst;
    this.values = values;
    this.precedents = precedents;
    this.missing = missing;
  }

  updateAst(
    formula: string,
    scope: string,
    ast: Ast,
    flatAst: Ast[],
    precedents: Reference[],
    missing: Missing
  ) {
    const data = { formula, scope, ast, flatAst, precedents, missing };

    this.formula = formula;
    this.scope = scope;
    this.ast = ast;
    this.flatAst = flatAst;
    this.precedents = precedents;
    this.missing = missing;

    this.eventEmitter.emit("updated", data);

    return data;
  }

  updateValues(values: Record<string, Value>) {
    this.values = values;
    this.eventEmitter.emit("valuesChanged", values);
  }

  once: AstEventEmitter["once"] = (...args) => this.eventEmitter.once(...args);
  on: AstEventEmitter["on"] = (...args) => this.eventEmitter.on(...args);
  off: AstEventEmitter["off"] = (...args) => this.eventEmitter.off(...args);
}

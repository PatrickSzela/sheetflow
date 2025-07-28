import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import { buildEmptyAst, type Ast } from "./ast";
import { type CellAddress } from "./cellAddress";
import { type Value } from "./cellValue";
import { type Reference } from "./reference";

export type MissingReferences = {
  sheets: string[];
  namedExpressions: string[];
};

export type PlacedAstValues = Record<string, Value>;
export type PlacedAstData = {
  formula: string;
  scope: string;
  ast: Ast;
  flatAst: Ast[];
  precedents: Reference[];
  missing: MissingReferences;
};

export type PlacedAstEvents = {
  valuesChanged: (values: PlacedAstValues) => void;
  updated: (data: PlacedAstData) => void;
};
export type PlacedAstEventEmitter = TypedEventEmitter<PlacedAstEvents>;

// TODO: read-only properties

export class PlacedAst {
  uuid: string;
  address: CellAddress;
  data: PlacedAstData;
  values: PlacedAstValues;

  protected eventEmitter: PlacedAstEventEmitter =
    new EventEmitter() as PlacedAstEventEmitter;

  constructor(
    uuid: string,
    address: CellAddress,
    data?: PlacedAstData,
    values?: PlacedAstValues,
  ) {
    this.uuid = uuid;
    this.address = address;
    this.values = values ?? {};
    this.data = data ?? {
      formula: "",
      scope: "",
      ast: buildEmptyAst({ value: null, rawContent: "" }),
      flatAst: [],
      precedents: [],
      missing: { namedExpressions: [], sheets: [] },
    };
  }

  updateData(data: PlacedAstData) {
    this.data = { ...data };
    this.eventEmitter.emit("updated", this.data);
    return this.data;
  }

  updateValues(values: PlacedAstValues) {
    this.values = values;
    this.eventEmitter.emit("valuesChanged", values);
  }

  once: PlacedAstEventEmitter["once"] = (...args) =>
    this.eventEmitter.once(...args);
  on: PlacedAstEventEmitter["on"] = (...args) => this.eventEmitter.on(...args);
  off: PlacedAstEventEmitter["off"] = (...args) =>
    this.eventEmitter.off(...args);
}

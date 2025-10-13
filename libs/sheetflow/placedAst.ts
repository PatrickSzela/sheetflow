import EventEmitter from "events";
import type { Edge } from "@xyflow/react";
import type TypedEventEmitter from "typed-emitter";
import { AstNode } from "@/components/nodes";
import { buildEmptyAst, type Ast } from "./ast";
import { type CellAddress } from "./cellAddress";
import { type Value } from "./cellValue";
import {
  generateEdges,
  generateElkLayout,
  generateNodes,
  injectValuesToFlow,
} from "./flow";
import { type Reference } from "./reference";

export type MissingReferences = {
  sheets: string[];
  namedExpressions: string[];
};

export type PlacedAstValues = Record<string, Value>;
export type PlacedAstData = {
  formula: string;
  scope: number;
  ast: Ast;
  flatAst: Ast[];
  precedents: Reference[];
  missing: MissingReferences;
};
export type PlacedAstFlowSettings = {
  skipParenthesis: boolean;
  skipValues: boolean;
};
export type PlacedAstFlow = {
  nodes: AstNode[];
  edges: Edge[];
  id: string;
} & PlacedAstFlowSettings;

export type PlacedAstEvents = {
  valuesChanged: (values: PlacedAstValues) => void;
  updated: (data: PlacedAstData) => void;
  flowChanged: (flow: PlacedAstFlow) => void;
};
export type PlacedAstEventEmitter = TypedEventEmitter<PlacedAstEvents>;

// TODO: read-only properties

export class PlacedAst {
  uuid: string;
  address: CellAddress;
  data: PlacedAstData;
  values: PlacedAstValues;
  flow: PlacedAstFlow;
  generatingFlowId: string | undefined;

  protected eventEmitter: PlacedAstEventEmitter =
    new EventEmitter() as PlacedAstEventEmitter;

  constructor(
    uuid: string,
    address: CellAddress,
    data?: PlacedAstData,
    values?: PlacedAstValues,
    flowSettings?: PlacedAstFlowSettings,
  ) {
    this.uuid = uuid;
    this.address = address;
    this.flow = {
      nodes: [],
      edges: [],
      id: "",
      skipParenthesis: false,
      skipValues: false,
      ...flowSettings,
    };
    this.values = values ?? {};
    this.data = data ?? {
      formula: "",
      scope: -1,
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
    this.values = { ...values };
    this.eventEmitter.emit("valuesChanged", this.values);
    return this.values;
  }

  updateFlowSettings(settings: Partial<PlacedAstFlowSettings>) {
    this.flow = { ...this.flow, ...settings };
    void this.generateFlow();
  }

  async generateFlow() {
    const { flatAst } = this.data;
    const { skipParenthesis, skipValues } = this.flow;

    const edges = generateEdges(flatAst, skipParenthesis, skipValues);

    const initNodes = generateNodes(
      flatAst,
      AstNode.settings,
      skipParenthesis,
      skipValues,
    );

    const id = crypto.randomUUID();
    this.generatingFlowId = id;

    console.group(`Generating flow "${id}"`);

    const nodes = await generateElkLayout(initNodes, edges);

    if (this.generatingFlowId !== id) {
      console.log(`Abandoning generated flow "${id}"`);
      console.groupEnd();
      return null;
    }

    console.log("Nodes:", nodes);
    console.log("Edges", edges);

    this.flow = { ...this.flow, nodes, edges, id };
    this.injectValues();

    console.groupEnd();

    return this.flow;
  }

  injectValues(injectToNodes = true, injectToEdges = false) {
    if (!this.flow)
      throw new Error(
        "Trying to inject values to a flow that wasn't generated yet",
      );

    const [nodes, edges] = [this.flow.nodes, this.flow.edges];

    const [newNodes, newEdges] = injectValuesToFlow(
      this.values,
      injectToNodes ? this.flow.nodes : undefined,
      injectToEdges ? this.flow.edges : undefined,
    );

    if (newNodes || newEdges)
      console.log("Values injected to flow:", this.values);

    this.flow = {
      ...this.flow,
      nodes: newNodes ?? nodes,
      edges: newEdges ?? edges,
    };

    this.eventEmitter.emit("flowChanged", this.flow);
  }

  once: PlacedAstEventEmitter["once"] = (...args) =>
    this.eventEmitter.once(...args);
  on: PlacedAstEventEmitter["on"] = (...args) => this.eventEmitter.on(...args);
  off: PlacedAstEventEmitter["off"] = (...args) =>
    this.eventEmitter.off(...args);
}

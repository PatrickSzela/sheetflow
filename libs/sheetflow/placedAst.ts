import EventEmitter from "events";
import type { Edge } from "@xyflow/react";
import type TypedEventEmitter from "typed-emitter";
import { AstNode } from "@/components/nodes";
import {
  buildEmptyAst,
  isAstWithValue,
  isParenthesisAst,
  type Ast,
} from "./ast";
import { type CellAddress } from "./cellAddress";
import { type Value } from "./cellValue";
import {
  generateEdges,
  generateElkLayout,
  generateNodes,
  injectValuesToFlow,
} from "./flow";
import type { NamedExpressionReference } from "./namedExpression";
import { type Reference } from "./reference";

export type MissingReferences = {
  sheets: string[];
  namedExpressions: string[];
};

export type PlacedAstValues = Record<string, Value>;
export type PlacedAstData = {
  formula: string;
  ast: Ast;
  flatAst: Ast[];
  precedents: Reference[];
  missing: MissingReferences;
};
export type PlacedAstFlowSettings = {
  generateParenthesis: boolean;
  generateValues: boolean;
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

export type PlacedAstSource = CellAddress | NamedExpressionReference;

// TODO: read-only properties

export class PlacedAst {
  id: string;
  source: PlacedAstSource;
  astAddress: CellAddress;
  data: PlacedAstData;
  values: PlacedAstValues;
  flow: PlacedAstFlow;
  generatingFlowId: string | undefined;

  protected eventEmitter: PlacedAstEventEmitter =
    new EventEmitter() as PlacedAstEventEmitter;

  constructor(
    id: string,
    source: PlacedAstSource,
    astAddress: CellAddress,
    data?: PlacedAstData,
    values?: PlacedAstValues,
    flowSettings?: PlacedAstFlowSettings,
  ) {
    this.id = id;
    this.source = source;
    this.astAddress = astAddress;
    this.flow = {
      nodes: [],
      edges: [],
      id: "",
      generateParenthesis: false,
      generateValues: false,
      ...flowSettings,
    };
    this.values = values ?? {};
    this.data = data ?? {
      formula: "",
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
    const shouldRegenerate = (
      key: keyof PlacedAstFlowSettings,
      isFn: (i: unknown) => boolean,
    ) =>
      key in settings &&
      this.flow[key] !== settings[key] &&
      !!this.data.flatAst.find((i) => isFn(i));

    const regenerateFlow =
      shouldRegenerate("generateParenthesis", isParenthesisAst) ||
      shouldRegenerate("generateValues", isAstWithValue);

    this.flow = { ...this.flow, ...settings };

    if (regenerateFlow) void this.generateFlow();
  }

  updateNodes(nodes: AstNode[]) {
    this.flow = { ...this.flow, nodes: nodes };
    this.eventEmitter.emit("flowChanged", this.flow);
  }

  async generateFlow() {
    const { flatAst } = this.data;
    const { generateParenthesis, generateValues } = this.flow;

    const edges = generateEdges(flatAst, generateParenthesis, generateValues);

    const initNodes = generateNodes(
      flatAst,
      AstNode.settings,
      generateParenthesis,
      generateValues,
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

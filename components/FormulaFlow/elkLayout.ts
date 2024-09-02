import { Edge, Node } from "@xyflow/react";
import Elk, { ElkExtendedEdge, ElkNode } from "elkjs";

const elk = new Elk();

const elkLayoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",

  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",

  "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
  "elk.layered.layering.strategy": "NETWORK_SIMPLEX",

  "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  "elk.layered.nodePlacement.bk.edgeStraightening": "NONE",
  "elk.layered.considerModelOrder.strategy": "PREFER_NODES",
};

export const generateElkNodes = <TNode extends Node>(
  nodes: TNode[]
): ElkNode[] => {
  return nodes.map((i) => ({
    id: i.id,
    width: i.measured?.width ?? i.width ?? 0,
    height: i.measured?.height ?? i.height ?? 0,
    x: i.position.x,
    y: i.position.y,
    layoutOptions: elkLayoutOptions,
  }));
};

export const generateElkEdges = <TEdge extends Edge>(
  edges: TEdge[]
): ElkExtendedEdge[] => {
  return edges.map((i) => ({
    id: i.id,
    sources: [i.source],
    targets: [i.target],
  }));
};

export const generateElkGraph = <TNode extends Node, TEdge extends Edge>(
  nodes: TNode[],
  edges: TEdge[]
): ElkNode => {
  return {
    id: "root",
    layoutOptions: elkLayoutOptions,
    children: generateElkNodes(nodes),
    edges: generateElkEdges(edges),
  };
};

export const generateElkLayout = async <TNode extends Node, TEdge extends Edge>(
  nodes: TNode[],
  edges: TEdge[]
): Promise<TNode[]> => {
  const graph = generateElkGraph(nodes, edges);

  const layout = (await elk.layout(graph)).children;

  if (!layout) return [];

  return layout.map((node) => {
    const initialNode = nodes.find((i) => i.id === node.id);

    if (!initialNode) throw new Error();

    return {
      ...initialNode,
      position: { x: node.x ?? 0, y: node.y ?? 0 },
    };
  });
};

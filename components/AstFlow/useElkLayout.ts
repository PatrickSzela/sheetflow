import { Edge, Node, useNodesInitialized, useReactFlow } from "@xyflow/react";
import Elk, { ElkExtendedEdge, ElkNode } from "elkjs";
import { useRef, useState } from "react";

const elk = new Elk();

const elkLayoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "LEFT",

  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",

  "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
  "elk.layered.layering.strategy": "NETWORK_SIMPLEX",

  "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  "elk.layered.nodePlacement.bk.edgeStraightening": "NONE",
  "elk.layered.considerModelOrder.strategy": "PREFER_NODES",
};

export const generateElkNodes = (nodes: Node[]): ElkNode[] => {
  return nodes.map((i) => ({
    id: i.id,
    width: i.computed?.width ?? i.width ?? 0,
    height: i.computed?.height ?? i.height ?? 0,
    x: i.position.x,
    y: i.position.y,
    layoutOptions: elkLayoutOptions,
  }));
};

export const generateElkEdges = (edges: Edge[]): ElkExtendedEdge[] => {
  return edges.map((i) => ({
    id: i.id,
    sources: [i.source],
    targets: [i.target],
  }));
};

export const generateElkGraph = (nodes: Node[], edges: Edge[]): ElkNode => {
  return {
    id: "root",
    layoutOptions: elkLayoutOptions,
    children: generateElkNodes(nodes),
    edges: generateElkEdges(edges),
  };
};

export const generateElkLayout = async (
  nodes: Node[],
  edges: Edge[]
): Promise<Node[]> => {
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

export const useElkLayout = () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const prevNodesInitialized = useRef<boolean>(false);
  const nodesInitialized = useNodesInitialized();

  const [layoutedNodes, setLayoutedNodes] = useState<Node[]>();
  const [layoutedEdges, setLayoutedEdges] = useState<Edge[]>();

  if (nodesInitialized && !prevNodesInitialized.current) {
    (async () => {
      const nodes = getNodes();
      const edges = getEdges();

      const oldNodesIds = layoutedNodes?.map((i) => i.id) ?? [];

      const nodesToBeLayouted = nodes.filter(
        (i) => !oldNodesIds.includes(i.id)
      );
      const edgesToBeLayouted = edges.filter(
        (i) => !oldNodesIds.includes(i.source)
      );

      const prevNodes = layoutedNodes ?? [];
      const prevEdges = edges.filter((i) => oldNodesIds.includes(i.source));

      if (!nodesToBeLayouted.length) return;

      // hide new nodes & edges until elk has finished calculating layout
      for (const item of [...nodesToBeLayouted, ...edgesToBeLayouted]) {
        item.hidden = true;
      }

      setNodes([...prevNodes, ...nodesToBeLayouted]);
      setEdges([...prevEdges, ...edgesToBeLayouted]);

      const elkNodes = await generateElkLayout(
        nodesToBeLayouted,
        edgesToBeLayouted
      );

      for (const item of [...elkNodes, ...edgesToBeLayouted]) {
        item.hidden = false;
      }

      setLayoutedNodes(elkNodes);
      setLayoutedEdges(edgesToBeLayouted);

      console.log("Layouted nodes", elkNodes);
      console.log("Layouted edges", edgesToBeLayouted);

      setNodes(elkNodes);
      setEdges(edgesToBeLayouted);
    })();
  }

  prevNodesInitialized.current = nodesInitialized;

  return { layoutedNodes, layoutedEdges };
};

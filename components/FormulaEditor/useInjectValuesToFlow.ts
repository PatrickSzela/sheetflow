import { useCallback, useEffect } from "react";
import { useReactFlow, type Edge } from "@xyflow/react";
import { type AstNode } from "@/components/nodes";
import {
  isAstWithChildren,
  printCellValue,
  type PlacedAst,
  type PlacedAstEvents,
  type Value,
} from "@/libs/sheetflow";

// TODO: simplify

export const injectValuesToFlow = (
  values: Record<string, Value>,
  nodes?: AstNode[],
  edges?: Edge[],
): [AstNode[] | undefined, Edge[] | undefined] => {
  let copyNodes: typeof nodes;
  let copyEdges: typeof edges;

  if (nodes?.length) {
    copyNodes = structuredClone(nodes);

    for (const { data } of copyNodes) {
      const { ast, output, inputs } = data;

      // nodes not synced with values
      if (!(ast.id in values)) return [undefined, undefined];

      if (output) output.value = values[ast.id];

      if (inputs && isAstWithChildren(ast)) {
        const { children } = ast;

        inputs.forEach((i, idx) => {
          if (children[idx].id in values) i.value = values[children[idx].id];
        });
      }
    }
  }

  if (edges?.length) {
    copyEdges = structuredClone(edges);

    for (const edge of copyEdges) {
      edge.label = printCellValue(values[edge.source]);
    }
  }

  if (copyNodes || copyEdges) console.log("Injected values to flow", values);

  return [copyNodes, copyEdges];
};

export const useInjectValuesToFlow = (
  placedAst: PlacedAst,
  injectToNodes = true,
  injectToEdges = false,
) => {
  const { updateNodeData, updateEdgeData, getNodes, getEdges } =
    useReactFlow<AstNode>();

  const injectValues = useCallback(
    (nodes: AstNode[], edges: Edge[]) => {
      const { values } = placedAst;

      [nodes = nodes, edges = edges] = injectValuesToFlow(
        values,
        injectToNodes ? nodes : undefined,
        injectToEdges ? edges : undefined,
      );

      return { nodes, edges };
    },
    [injectToEdges, injectToNodes, placedAst],
  );

  useEffect(() => {
    const onValuesChanged: PlacedAstEvents["valuesChanged"] = () => {
      const { nodes, edges } = injectValues(getNodes(), getEdges());

      for (const { id, data } of nodes) {
        updateNodeData(id, data);
      }

      for (const { id, data } of edges) {
        updateEdgeData(id, data);
      }
    };

    placedAst.on("valuesChanged", onValuesChanged);

    return () => {
      placedAst.off("valuesChanged", onValuesChanged);
    };
  }, [
    getEdges,
    getNodes,
    injectValues,
    placedAst,
    updateEdgeData,
    updateNodeData,
  ]);

  return { injectValues };
};

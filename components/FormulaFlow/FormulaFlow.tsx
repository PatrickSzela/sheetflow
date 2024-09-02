import { BaseNode, nodeTypes } from "@/components/nodes";
import { Ast, CellValue } from "@/libs/sheetflow";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  ReactFlow,
  ReactFlowProps,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useRef } from "react";
import { generateElkLayout } from "./elkLayout";
import { generateEdges, generateNodes } from "./generateFlow";

import "@xyflow/react/dist/style.css";

// TODO: cleanup
// TODO: get cached value of node from hyperformula for initial values

export interface FormulaFlowProps extends Omit<ReactFlowProps, "nodes"> {
  ast: Ast | undefined;
  flatAst: Ast[] | undefined;
  values: Record<string, CellValue> | undefined;
  skipParenthesis?: Boolean;
}

export const FormulaFlow = (props: FormulaFlowProps) => {
  return (
    <ReactFlowProvider>
      <FormulaFlowInner {...props} />
    </ReactFlowProvider>
  );
};

const FormulaFlowInner = (props: FormulaFlowProps) => {
  const { ast, flatAst, values, skipParenthesis, ...otherProps } = props;

  const prevAst = useRef<Ast>();
  const prevSkipParenthesis = useRef<Boolean>();
  const prevValues = useRef<Record<string, CellValue>>();

  const generatedLayout = useRef(0); // to avoid race conditions
  const injectValues = useRef(false); // to avoid race conditions

  const [nodes, setNodes, onNodesChange] = useNodesState<BaseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  if (
    (prevAst.current !== ast ||
      prevSkipParenthesis.current !== skipParenthesis) &&
    flatAst
  ) {
    prevAst.current = ast;
    prevSkipParenthesis.current = skipParenthesis;
    generatedLayout.current++;

    const nodes = generateNodes(flatAst, skipParenthesis);
    const edges = generateEdges(flatAst, skipParenthesis);

    generateElkLayout(nodes, edges).then((nodes) => {
      console.log("Generated nodes", nodes);
      console.log("Generated edges", edges);

      setNodes(nodes);
      setEdges(edges);

      generatedLayout.current--;

      injectValues.current = true;
    });
  }

  if (
    values &&
    generatedLayout.current === 0 &&
    (injectValues.current || prevValues.current !== values)
  ) {
    prevValues.current = values;
    injectValues.current = false;

    console.log("Modifying edges & nodes", values);

    const copyEdges = structuredClone(edges);
    const copyNodes = structuredClone(nodes);

    for (const edge of copyEdges) {
      edge.label = `${values[edge.source].value}`;
    }

    for (const node of copyNodes) {
      node.data.values =
        "children" in node.data.ast
          ? node.data.ast.children.map((ast) => values[ast.id])
          : [];
    }

    setEdges(copyEdges);
    setNodes(copyNodes);
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      // @ts-expect-error
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      colorMode="system"
      {...otherProps}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

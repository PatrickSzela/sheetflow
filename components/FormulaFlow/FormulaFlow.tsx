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
import {
  generateEdges,
  generateNodes,
  injectValuesToFlow,
} from "./generateFlow";

import "@xyflow/react/dist/style.css";

// TODO: cleanup

export interface FormulaFlowProps<
  TNode extends BaseNode = BaseNode,
  TEdge extends Edge = Edge,
> extends Omit<ReactFlowProps<TNode, TEdge>, "nodes"> {
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

  const generatingLayout = useRef(0); // to avoid race conditions

  const [nodes, setNodes, onNodesChange] = useNodesState<BaseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const updateFlowWithValues = (
    nodes: BaseNode[],
    edges: Edge[],
    values: Record<string, CellValue>
  ) => {
    const [newNodes, newEdges] = injectValuesToFlow(nodes, edges, values);

    setNodes(newNodes);
    setEdges(newEdges);

    prevValues.current = values;
  };

  // on ast/skipParenthesis change
  if (
    flatAst &&
    values &&
    (prevAst.current !== ast || prevSkipParenthesis.current !== skipParenthesis)
  ) {
    prevAst.current = ast;
    prevSkipParenthesis.current = skipParenthesis;
    generatingLayout.current++;

    const nodes = generateNodes(flatAst, skipParenthesis);
    const edges = generateEdges(flatAst, skipParenthesis);

    generateElkLayout(nodes, edges).then((nodes) => {
      console.log("Generated nodes", nodes);
      console.log("Generated edges", edges);

      updateFlowWithValues(nodes, edges, values);

      generatingLayout.current--;
    });
  }

  // on values updated
  if (
    values &&
    nodes.length &&
    generatingLayout.current === 0 &&
    prevValues.current !== values
  ) {
    console.log("Updating values...");
    updateFlowWithValues(nodes, edges, values);
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      colorMode="system"
      nodesConnectable={false}
      {...otherProps}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

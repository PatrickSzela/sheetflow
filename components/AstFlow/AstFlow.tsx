import { Ast, flattenAst } from "@/libs/sheetflow";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProps,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useRef } from "react";
import { generateEdges, generateNodes } from "./flow";
import { useElkLayout } from "./useElkLayout";

export interface AstFlowProps extends Omit<ReactFlowProps, "nodes"> {
  ast: Ast;
}

export const AstFlowWrapped = (props: AstFlowProps) => {
  return (
    <ReactFlowProvider>
      <AstFlow {...props} />
    </ReactFlowProvider>
  );
};

const AstFlow = (props: AstFlowProps) => {
  const { ast, ...otherProps } = props;

  const prevAst = useRef<Ast>();
  const flatAst = useMemo(() => flattenAst(ast), [ast]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  if (prevAst.current !== ast) {
    prevAst.current = ast;

    const _nodes = generateNodes(flatAst);
    const _edges = generateEdges(flatAst);

    // we append new nodes & edges to show old nodes while elk is calculating positions for the new ones
    setNodes((prev) => [...prev, ..._nodes]);
    setEdges((prev) => [...prev, ..._edges]);

    console.log("Generated nodes", _nodes);
    console.log("Generated edges", _edges);
  }

  useElkLayout();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      colorMode="system"
      {...otherProps}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

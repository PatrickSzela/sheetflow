import { nodeTypes } from "@/components/nodes";
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
import { generateElkLayout } from "./useElkLayout";

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

    const nodes = generateNodes(flatAst);
    const edges = generateEdges(flatAst);

    generateElkLayout(nodes, edges).then((nodes) => {
      console.log("Generated nodes", nodes);
      console.log("Generated edges", edges);

      setNodes(nodes);
      setEdges(edges);
    });
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
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

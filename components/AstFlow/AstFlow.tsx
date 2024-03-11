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
  useNodesInitialized,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
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

  const nodesInitialized = useNodesInitialized();

  const [prevAst, setPrevAst] = useState<Ast>();
  const [prevAst2, setPrevAst2] = useState<Ast>();

  const flatAst = useMemo(() => flattenAst(ast), [ast]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  if (prevAst !== ast) {
    const _nodes = generateNodes(flatAst, nodes);
    const _edges = generateEdges(flatAst);

    setNodes(_nodes);
    setEdges(_edges);

    setPrevAst(ast);

    console.log("Generated nodes", _nodes);
    console.log("Generated edges", _edges);
  }

  if (nodesInitialized) {
    (async () => {
      if (prevAst !== prevAst2 && nodes.length && nodes[0].computed) {
        setPrevAst2(prevAst);

        const layoutNodes = await generateElkLayout(nodes, edges);

        setNodes(layoutNodes);

        console.log("Layouted nodes", layoutNodes);
      }
    })();
  }

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

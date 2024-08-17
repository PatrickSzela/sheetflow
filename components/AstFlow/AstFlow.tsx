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
import { CellValue } from "hyperformula";
import { useRef } from "react";
import { generateEdges, generateNodes } from "./flow";
import { generateElkLayout } from "./useElkLayout";

// TODO: cleanup

export interface AstFlowProps extends Omit<ReactFlowProps, "nodes"> {
  ast: Ast | undefined;
  flatAst: ReturnType<typeof flattenAst> | undefined;
  values: CellValue[] | undefined;
}

export const AstFlowWrapped = (props: AstFlowProps) => {
  return (
    <ReactFlowProvider>
      <AstFlow {...props} />
    </ReactFlowProvider>
  );
};

const AstFlow = (props: AstFlowProps) => {
  const { ast, flatAst, values, ...otherProps } = props;

  const prevAst = useRef<Ast>();
  const prevValues = useRef<CellValue[]>();
  const generatedLayout = useRef(0); // to avoid race conditions

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  if (prevAst.current !== ast && flatAst) {
    prevAst.current = ast;
    generatedLayout.current++;

    const nodes = generateNodes(flatAst);
    const edges = generateEdges(flatAst);

    generateElkLayout(nodes, edges).then((nodes) => {
      console.log("Generated nodes", nodes);
      console.log("Generated edges", edges);

      setNodes(nodes);
      setEdges(edges);

      generatedLayout.current--;
    });
  }

  if (
    prevValues.current !== values &&
    values &&
    generatedLayout.current === 0
  ) {
    prevValues.current = values;

    console.log("Modifying edges", values);

    const copy = structuredClone(edges);

    copy.map((edge, idx) => {
      edge.label = `${values[idx + 1]}`;
    });

    setEdges(copy);
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

import { BaseNode, nodeTypes } from "@/components/nodes";
import { Ast, flattenAst } from "@/libs/sheetflow";
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
import "@xyflow/react/dist/style.css";
import { CellValue } from "hyperformula";
import { useRef } from "react";
import { generateEdges, generateNodes } from "./flow";
import { generateElkLayout } from "./useElkLayout";

// TODO: cleanup

export interface AstFlowProps extends Omit<ReactFlowProps, "nodes"> {
  ast: Ast | undefined;
  flatAst: ReturnType<typeof flattenAst> | undefined;
  values: Record<string, CellValue> | undefined;
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
  const prevValues = useRef<Record<string, CellValue>>();
  const generatedLayout = useRef(0); // to avoid race conditions

  const [nodes, setNodes, onNodesChange] = useNodesState<BaseNode>([]);
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

    console.log("Modifying edges & nodes", values);

    const copyEdges = structuredClone(edges);
    const copyNodes = structuredClone(nodes);

    for (const edge of copyEdges) {
      edge.label = `${values[edge.source]}`;
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

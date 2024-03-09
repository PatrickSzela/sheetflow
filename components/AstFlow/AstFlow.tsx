import { Ast, AstNodeType, flattenAst } from "@/libs/sheetflow";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";

export interface AstFlowProps extends Omit<ReactFlowProps, "nodes"> {
  ast: Ast;
}

export const AstFlow = (props: AstFlowProps) => {
  const { ast, ...otherProps } = props;

  const flatAst = useMemo(() => flattenAst(ast), [ast]);

  const initialNodes = useMemo<Node[]>(() => {
    let parenthesisX = 0;
    let parenthesisY = 0;

    const arr: Node[] = flatAst.map((i) => {
      parenthesisY++;

      if (i.type === AstNodeType.PARENTHESIS) {
        parenthesisX++;
        parenthesisY = 0;
      }

      return {
        id: i.id,

        ...(i.nearestParenthesis && { parentNode: i.nearestParenthesis }),

        ...(i.type === AstNodeType.PARENTHESIS
          ? {
              position: { x: parenthesisX * 200, y: 0 },
              data: { label: null },
              type: "group",
            }
          : {
              position: { x: 0, y: parenthesisY * 100 },
              data: { label: `${i.type}: ${i.rawContent}` },
            }),
      };
    });

    console.log("Nodes", arr);

    return arr;
  }, [flatAst]);

  const initialEdges = useMemo<Edge[]>(() => {
    let arr: Edge[] = [];

    flatAst.forEach((ast) => {
      if (!("children" in ast) || ast.type === AstNodeType.PARENTHESIS) return;

      ast.children.forEach((inner) => {
        const c =
          inner.type === AstNodeType.PARENTHESIS ? inner.children[0] : inner;

        arr = [
          ...arr,
          {
            id: `${ast.id} - ${c.id}`,
            source: ast.id,
            target: c.id,
          },
        ];
      });
    });

    console.log("Edges", arr);

    return arr;
  }, [flatAst]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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

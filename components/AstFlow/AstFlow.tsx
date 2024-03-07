import { Ast, AstNodeType, flattenAst } from "@/libs/sheetflow";
import {
  Background,
  Controls,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProps,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";

export interface AstFlowProps extends Omit<ReactFlowProps, "nodes"> {
  ast: Ast;
}

export const AstFlow = (props: AstFlowProps) => {
  const { ast, ...otherProps } = props;

  const initialNodes = useMemo<Node[]>(() => {
    let parenthesisX = 0;
    let parenthesisY = 0;

    const flat: Node[] = flattenAst(ast).map((i, idx) => {
      parenthesisY++;

      if (i.type === AstNodeType.PARENTHESIS) {
        parenthesisX++;
        parenthesisY = 0;
      }

      return {
        id: i.id,
        parentNode: i.nearestParenthesis,

        ...(i.type === AstNodeType.PARENTHESIS
          ? {
              position: { x: parenthesisX * 200, y: 0 },
              data: { label: null },
              type: "group",
            }
          : {
              position: { x: 0, y: parenthesisY * 100 },
              data: { label: i.type },
            }),
      };
    });

    return flat;
  }, [ast]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      colorMode="system"
      {...otherProps}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

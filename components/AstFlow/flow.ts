import { BaseNode } from "@/components/nodes";
import { Ast, AstNodeType } from "@/libs/sheetflow";
import { Edge, Node, Position } from "@xyflow/react";

export const generateNodes = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false
): Node[] => {
  const flat = skipParenthesis
    ? flatAst.filter((i) => i.type !== AstNodeType.PARENTHESIS)
    : flatAst;

  const nodes: BaseNode[] = flat.map((ast) => {
    return {
      id: ast.id,
      position: { x: 0, y: 0 },
      data: { ast },
      type: "baseNode",

      // TODO: calculate approx size of nodes based on the amount of args
      width: 150,
      height: 70,

      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    };
  });

  return nodes;
};

export const generateEdges = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false
): Edge[] => {
  let arr: Edge[] = [];

  for (const ast of flatAst) {
    if (!("children" in ast)) continue;

    if (skipParenthesis && ast.type === AstNodeType.PARENTHESIS) continue;

    ast.children.forEach((inner, idx) => {
      const child = skipParenthesis
        ? inner.type === AstNodeType.PARENTHESIS
          ? inner.children[0]
          : inner
        : inner;

      arr = [
        ...arr,
        {
          id: `${child.id} - ${ast.id}`,
          source: child.id,
          target: ast.id,
          targetHandle: child.id,
        },
      ];
    });
  }

  return arr;
};

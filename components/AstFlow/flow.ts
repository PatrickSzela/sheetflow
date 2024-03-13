import { Ast, AstNodeType } from "@/libs/sheetflow";
import { Edge, Node, Position } from "@xyflow/react";

export const generateNodes = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false
): Node[] => {
  const flat = skipParenthesis
    ? flatAst.filter((i) => i.type !== AstNodeType.PARENTHESIS)
    : flatAst;

  const nodes: Node[] = flat.map((ast) => {
    return {
      id: ast.id,
      position: { x: 0, y: 0 },
      data: { label: `${ast.type}: ${ast.rawContent}` },
      // data: { label: cur.id },

      targetPosition: Position.Right,
      sourcePosition: Position.Left,

      ...((ast.type === AstNodeType.VALUE ||
        ast.type === AstNodeType.REFERENCE) && {
        type: "output",
      }),
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

    ast.children.forEach((inner) => {
      const child = skipParenthesis
        ? inner.type === AstNodeType.PARENTHESIS
          ? inner.children[0]
          : inner
        : inner;

      arr = [
        ...arr,
        {
          id: `${ast.id} - ${child.id}`,
          source: ast.id,
          target: child.id,
          // targetHandle: String.fromCharCode("a".charCodeAt(0) + idx),
        },
      ];
    });
  }

  return arr;
};

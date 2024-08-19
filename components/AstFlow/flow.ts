import { BaseNode, calculateNodeSize } from "@/components/nodes";
import { Ast, AstNodeType } from "@/libs/sheetflow";
import { Edge, Node } from "@xyflow/react";

export const generateNodes = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false
): BaseNode[] => {
  const flat = skipParenthesis
    ? flatAst.filter((i) => i.type !== AstNodeType.PARENTHESIS)
    : flatAst;

  const nodes: BaseNode[] = flat.map((ast) => {
    return {
      id: ast.id,
      position: { x: 0, y: 0 },
      data: { ast, values: [] },
      type: "baseNode",
      ...calculateNodeSize(ast),
    };
  });

  return nodes;
};

export const generateEdges = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false
): Edge[] => {
  const arr: Edge[] = [];

  for (const ast of flatAst) {
    if (!("children" in ast)) continue;

    if (skipParenthesis && ast.type === AstNodeType.PARENTHESIS) continue;

    for (const inner of ast.children) {
      const child = skipParenthesis
        ? inner.type === AstNodeType.PARENTHESIS
          ? inner.children[0]
          : inner
        : inner;

      arr.push({
        id: `${child.id} - ${ast.id}`,
        source: child.id,
        target: ast.id,
        targetHandle: child.id,
      });
    }
  }

  // reorder edges to be in the same order as nodes in `flatAst` for much easier way of displaying data on them
  return arr.sort(
    (a, b) =>
      flatAst.findIndex((ast) => ast.id === a.source) -
      flatAst.findIndex((ast) => ast.id === b.source)
  );
};

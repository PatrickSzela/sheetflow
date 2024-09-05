import { BaseNode, calculateNodeSize } from "@/components/nodes";
import { Ast, AstNodeType, CellValue } from "@/libs/sheetflow";
import { Edge } from "@xyflow/react";

export const generateNodes = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false
): BaseNode[] => {
  const flat = skipParenthesis
    ? flatAst.filter((i) => i.type !== AstNodeType.PARENTHESIS)
    : flatAst;

  const nodes: BaseNode[] = flat.map((ast, idx) => {
    return {
      id: ast.id,
      position: { x: 0, y: 0 },
      data: { ast, values: [], hasOutput: idx !== 0 },
      type: "baseNode",
      ...calculateNodeSize(ast),
    };
  });

  return nodes;
};

const findNearestNonParenthesisChild = (ast: Ast) => {
  if (ast.type === AstNodeType.PARENTHESIS)
    return findNearestNonParenthesisChild(ast.children[0]);

  return ast;
};

export const generateEdges = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false
): Edge[] => {
  const arr: Edge[] = [];

  for (const ast of flatAst) {
    if (!("children" in ast)) continue;

    if (skipParenthesis && ast.type === AstNodeType.PARENTHESIS) continue;

    let idx = 0;
    for (const inner of ast.children) {
      const child = skipParenthesis
        ? findNearestNonParenthesisChild(inner)
        : inner;

      arr.push({
        id: `${child.id} - ${ast.id}`,
        source: child.id,
        target: ast.id,
        targetHandle: `${idx}`,
      });

      idx++;
    }
  }

  // reorder edges to be in the same order as nodes in `flatAst` for much easier way of displaying data on them
  return arr.sort(
    (a, b) =>
      flatAst.findIndex((ast) => ast.id === a.source) -
      flatAst.findIndex((ast) => ast.id === b.source)
  );
};

export const injectValuesToFlow = (
  nodes: BaseNode[],
  edges: Edge[],
  values: Record<string, CellValue>
): [BaseNode[], Edge[]] => {
  console.log("Modifying edges & nodes with values", values);

  const copyEdges = structuredClone(edges);
  const copyNodes = structuredClone(nodes);

  for (const edge of copyEdges) {
    edge.label = `${values[edge.source].value}`;
  }

  for (const node of copyNodes) {
    node.data.values =
      "children" in node.data.ast
        ? node.data.ast.children.map((ast) => values[ast.id])
        : [];
  }

  return [copyNodes, copyEdges];
};

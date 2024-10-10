import { AstNode, calculateNodeSize, NodeSettings } from "@/components/nodes";
import {
  Ast,
  AstNodeType,
  isAstWithChildren,
  printCellValue,
  Value,
} from "@/libs/sheetflow";
import { Edge } from "@xyflow/react";

export const generateNodes = (
  flatAst: Ast[],
  skipParenthesis: Boolean = false,
  nodeSettings: NodeSettings
): AstNode[] => {
  const flat = skipParenthesis
    ? flatAst.filter((i) => i.type !== AstNodeType.PARENTHESIS)
    : flatAst;

  const nodes: AstNode[] = flat.map((ast, idx) => {
    return {
      id: ast.id,
      position: { x: 0, y: 0 },
      data: { ast },
      type: "ast",
      ...calculateNodeSize(ast, nodeSettings),
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
    if (!isAstWithChildren(ast)) continue;
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
  values: Record<string, Value>,
  nodes?: AstNode[],
  edges?: Edge[]
): [AstNode[] | undefined, Edge[] | undefined] => {
  console.log("Injecting values to flow", values);

  let copyNodes: typeof nodes;
  let copyEdges: typeof edges;

  if (nodes) {
    copyNodes = structuredClone(nodes);

    copyNodes.forEach((node, idx) => {
      node.data.output = {
        value: values[node.data.ast.id],
        handleId: idx ? "0" : undefined,
      };

      node.data.inputs = isAstWithChildren(node.data.ast)
        ? node.data.ast.children.map((ast, idx) => ({
            value: values[ast.id],
            handleId: `${idx}`,
          }))
        : [];
    });
  }

  if (edges) {
    copyEdges = structuredClone(edges);

    for (const edge of copyEdges) {
      edge.label = printCellValue(values[edge.source]);
    }
  }

  return [copyNodes, copyEdges];
};

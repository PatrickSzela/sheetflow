import { type Edge } from "@xyflow/react";
import {
  calculateNodeSize,
  type AstNode,
  type AstNodeValue,
  type NodeSettings,
} from "@/components/nodes";
import {
  AstNodeType,
  isAstWithChildren,
  isAstWithValue,
  isParenthesisAst,
  type Ast,
} from "../ast";
import { buildStringCellValue, printCellValue, type Value } from "../cellValue";

const findNearestChild = (
  ast: Ast,
  allowParenthesis = true,
  allowValues = true,
) => {
  if (allowParenthesis && allowValues) return ast;

  if (!allowParenthesis && ast.type === AstNodeType.PARENTHESIS)
    return findNearestChild(ast.children[0], allowParenthesis, allowValues);
  else if (!allowValues && ast.type === AstNodeType.VALUE) return null;

  return ast;
};

export const generateNodes = (
  flatAst: Ast[],
  nodeSettings: NodeSettings,
  generateParenthesis = true,
  generateValues = true,
): AstNode[] => {
  let flat = flatAst;

  if (!generateParenthesis && flat.length > 1) {
    flat = flat.filter((i) => !isParenthesisAst(i));
  }

  if (!generateValues && flat.length > 1) {
    flat = flat.filter((i) => !isAstWithValue(i));
  }

  if (!flat.length) flat = flatAst;

  const nodes: AstNode[] = flat.map((ast, idx) => {
    let inputs: AstNodeValue[] = [];

    if (isAstWithChildren(ast)) {
      inputs = ast.children.map((child, idx) => ({
        value: buildStringCellValue({ value: child.rawContent }),
        ...(findNearestChild(child, generateParenthesis, generateValues) && {
          handleId: `${idx}`,
        }),
      }));
    }

    const output: AstNodeValue = {
      value: buildStringCellValue({ value: ast.rawContent }),
      ...(idx && { handleId: "0" }),
    };

    return {
      id: ast.id,
      position: { x: 0, y: 0 },
      data: { ast, inputs, output },
      type: "ast",
      ...calculateNodeSize(ast, nodeSettings),
    };
  });

  return nodes;
};

export const generateEdges = (
  flatAst: Ast[],
  generateParenthesis = true,
  generateValues = true,
): Edge[] => {
  const arr: Edge[] = [];

  for (const ast of flatAst) {
    if (!isAstWithChildren(ast)) continue;
    if (!generateParenthesis && isParenthesisAst(ast)) continue;

    ast.children.forEach((inner, idx) => {
      if (!generateValues && isAstWithValue(inner)) return;

      const child = findNearestChild(
        inner,
        generateParenthesis,
        generateValues,
      );

      if (child) {
        arr.push({
          id: `${child.id} - ${ast.id}`,
          source: child.id,
          target: ast.id,
          targetHandle: `${idx}`,
        });
      }
    });
  }

  // reorder edges to be in the same order as nodes in `flatAst` for much easier way of displaying data on them
  return arr.sort(
    (a, b) =>
      flatAst.findIndex((ast) => ast.id === a.source) -
      flatAst.findIndex((ast) => ast.id === b.source),
  );
};

// TODO: simplify
export const injectValuesToFlow = (
  values: Record<string, Value>,
  nodes?: AstNode[],
  edges?: Edge[],
): [AstNode[] | undefined, Edge[] | undefined] => {
  let copyNodes: typeof nodes;
  let copyEdges: typeof edges;

  if (nodes?.length) {
    copyNodes = structuredClone(nodes);

    for (const { data } of copyNodes) {
      const { ast, output, inputs } = data;

      // nodes not synced with values
      if (!(ast.id in values)) return [undefined, undefined];

      if (output) output.value = values[ast.id];

      if (inputs && isAstWithChildren(ast)) {
        const { children } = ast;

        inputs.forEach((i, idx) => {
          if (children[idx].id in values) i.value = values[children[idx].id];
        });
      }
    }
  }

  if (edges?.length) {
    copyEdges = structuredClone(edges);

    for (const edge of copyEdges) {
      edge.label = printCellValue(values[edge.source]);
    }
  }

  return [copyNodes, copyEdges];
};

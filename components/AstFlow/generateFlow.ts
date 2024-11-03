import {
  AstNode,
  AstNodeValue,
  calculateNodeSize,
  NodeSettings,
} from "@/components/nodes";
import {
  Ast,
  AstNodeType,
  buildStringCellValue,
  isAstWithChildren,
  isAstWithValue,
  isParenthesisAst,
} from "@/libs/sheetflow";
import { Edge } from "@xyflow/react";

export const generateNodes = (
  flatAst: Ast[],
  nodeSettings: NodeSettings,
  skipParenthesis: boolean = false,
  skipValues: boolean = false
): AstNode[] => {
  let flat = flatAst;

  if (skipParenthesis && flat.length > 1) {
    flat = flat.filter((i) => !isParenthesisAst(i));
  }

  if (skipValues && flat.length > 1) {
    flat = flat.filter((i) => !isAstWithValue(i));
  }

  if (!flat.length) flat = flatAst;

  const nodes: AstNode[] = flat.map((ast, idx) => {
    let inputs: AstNodeValue[] = [];

    if (isAstWithChildren(ast)) {
      inputs = ast.children.map((child, idx) => ({
        value: buildStringCellValue({ value: child.rawContent }),
        handleId: skipValues && isAstWithValue(child) ? undefined : `${idx}`,
      }));
    }

    const output: AstNodeValue = {
      value: buildStringCellValue({ value: ast.rawContent }),
      handleId: idx ? "0" : undefined,
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

const findNearestNonParenthesisChild = (ast: Ast) => {
  if (ast.type === AstNodeType.PARENTHESIS)
    return findNearestNonParenthesisChild(ast.children[0]);

  return ast;
};

export const generateEdges = (
  flatAst: Ast[],
  skipParenthesis: boolean = false,
  skipValues: boolean = false
): Edge[] => {
  const arr: Edge[] = [];

  for (const ast of flatAst) {
    if (!isAstWithChildren(ast)) continue;
    if (skipParenthesis && isParenthesisAst(ast)) continue;

    ast.children.forEach((inner, idx) => {
      if (skipValues && isAstWithValue(inner)) return;

      const child = skipParenthesis
        ? findNearestNonParenthesisChild(inner)
        : inner;

      arr.push({
        id: `${child.id} - ${ast.id}`,
        source: child.id,
        target: ast.id,
        targetHandle: `${idx}`,
      });
    });
  }

  // reorder edges to be in the same order as nodes in `flatAst` for much easier way of displaying data on them
  return arr.sort(
    (a, b) =>
      flatAst.findIndex((ast) => ast.id === a.source) -
      flatAst.findIndex((ast) => ast.id === b.source)
  );
};

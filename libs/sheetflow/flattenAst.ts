import { Ast, AstNodeSubtype, AstNodeType } from "./ast";

export const flattenAst = (
  ast: Ast,
  nearestParenthesis?: string
): (Ast & { nearestParenthesis?: string })[] => {
  switch (ast.type) {
    case AstNodeType.VALUE:
      // TODO: finish array
      return ast.subtype === AstNodeSubtype.ARRAY
        ? []
        : [{ ...ast, nearestParenthesis }];
    case AstNodeType.REFERENCE:
      return [{ ...ast, nearestParenthesis }];
    case AstNodeType.FUNCTION:
      return [
        { ...ast, nearestParenthesis },
        ...ast.children.map((i) => flattenAst(i, nearestParenthesis)).flat(),
      ];
    case AstNodeType.UNARY_EXPRESSION:
      return [
        { ...ast, nearestParenthesis },
        ...ast.children.map((i) => flattenAst(i, nearestParenthesis)).flat(),
      ];
    case AstNodeType.BINARY_EXPRESSION:
      return [
        { ...ast, nearestParenthesis },
        ...ast.children.map((i) => flattenAst(i, nearestParenthesis)).flat(),
      ];
    case AstNodeType.PARENTHESIS:
      return [
        { ...ast, nearestParenthesis },
        ...ast.children.map((i) => flattenAst(i, ast.id)).flat(),
      ];
    case AstNodeType.ERROR:
      return [ast];
  }
};

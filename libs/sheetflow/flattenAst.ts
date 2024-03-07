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
        ...ast.args.map((i) => flattenAst(i, nearestParenthesis)).flat(),
      ];
    case AstNodeType.UNARY_EXPRESSION:
      return [
        { ...ast, nearestParenthesis },
        ...flattenAst(ast.value, nearestParenthesis),
      ];
    case AstNodeType.BINARY_EXPRESSION:
      return [
        { ...ast, nearestParenthesis },
        ...flattenAst(ast.left, nearestParenthesis),
        ...flattenAst(ast.right, nearestParenthesis),
      ];
    case AstNodeType.PARENTHESIS:
      return [
        { ...ast, nearestParenthesis },
        ...flattenAst(ast.content, ast.id),
      ];
    case AstNodeType.ERROR:
      return [ast];
  }
};

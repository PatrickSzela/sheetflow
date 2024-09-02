import { Ast, AstNodeSubtype, AstNodeType } from "./ast";

export const flattenAst = (ast: Ast): Ast[] => {
  switch (ast.type) {
    case AstNodeType.VALUE:
      // TODO: finish array
      return ast.subtype === AstNodeSubtype.ARRAY ? [] : [ast];

    case AstNodeType.ERROR:
    case AstNodeType.REFERENCE:
      return [ast];

    case AstNodeType.FUNCTION:
    case AstNodeType.UNARY_EXPRESSION:
    case AstNodeType.BINARY_EXPRESSION:
    case AstNodeType.PARENTHESIS:
      return [ast, ...ast.children.map((i) => flattenAst(i)).flat()];
  }
};

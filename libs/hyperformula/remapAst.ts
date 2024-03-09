import {
  Ast,
  buildArrayAst,
  buildBinaryExpressionAst,
  buildCellRangeReferenceAst,
  buildCellReferenceAst,
  buildColumnRangeReferenceAst,
  buildEmptyAst,
  buildErrorAst,
  buildFunctionAst,
  buildNamedExpressionReferenceAst,
  buildNumberAst,
  buildParenthesisAst,
  buildRowRangeReferenceAst,
  buildStringAst,
  buildUnaryExpressionAst,
} from "@/libs/sheetflow";
import { HyperFormula, SimpleCellAddress } from "hyperformula";
import {
  Ast as HfAst,
  AstNodeType as HfAstNodeType,
} from "hyperformula/commonjs/parser";
import { remapCellAddress } from "./remapCellAddress";

export const remapAst = (
  hf: HyperFormula,
  ast: HfAst,
  address: SimpleCellAddress
): Ast => {
  // @ts-expect-error we're using protected property here
  const rawContent = hf._unparser.unparse(ast, address).slice(1);

  switch (ast.type) {
    case HfAstNodeType.EMPTY:
      return buildEmptyAst();
    case HfAstNodeType.NUMBER:
      return buildNumberAst({ value: ast.value, rawContent });
    case HfAstNodeType.STRING:
      return buildStringAst({ value: ast.value, rawContent });
    case HfAstNodeType.MINUS_UNARY_OP:
      return buildUnaryExpressionAst({
        operator: "-",
        children: [remapAst(hf, ast.value, address)],
        operatorOnRight: false,
        rawContent,
      });
    case HfAstNodeType.PLUS_UNARY_OP:
      return buildUnaryExpressionAst({
        operator: "+",
        children: [remapAst(hf, ast.value, address)],
        operatorOnRight: false,
        rawContent,
      });
    case HfAstNodeType.PERCENT_OP:
      return buildUnaryExpressionAst({
        operator: "%",
        children: [remapAst(hf, ast.value, address)],
        operatorOnRight: true,
        rawContent,
      });
    case HfAstNodeType.CONCATENATE_OP:
      return buildBinaryExpressionAst({
        operator: "&",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.EQUALS_OP:
      return buildBinaryExpressionAst({
        operator: "=",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.NOT_EQUAL_OP:
      return buildBinaryExpressionAst({
        operator: "<>",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.GREATER_THAN_OP:
      return buildBinaryExpressionAst({
        operator: ">",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.LESS_THAN_OP:
      return buildBinaryExpressionAst({
        operator: "<",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.GREATER_THAN_OR_EQUAL_OP:
      return buildBinaryExpressionAst({
        operator: ">=",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.LESS_THAN_OR_EQUAL_OP:
      return buildBinaryExpressionAst({
        operator: "<=",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.PLUS_OP:
      return buildBinaryExpressionAst({
        operator: "+",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.MINUS_OP:
      return buildBinaryExpressionAst({
        operator: "-",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.TIMES_OP:
      return buildBinaryExpressionAst({
        operator: "*",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.DIV_OP:
      return buildBinaryExpressionAst({
        operator: "/",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.POWER_OP:
      return buildBinaryExpressionAst({
        operator: "^",
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
      });
    case HfAstNodeType.FUNCTION_CALL:
      return buildFunctionAst({
        functionName: ast.procedureName,
        children: ast.args.map((i) => remapAst(hf, i, address)),
        rawContent,
      });
    case HfAstNodeType.NAMED_EXPRESSION:
      return buildNamedExpressionReferenceAst({
        expressionName: ast.expressionName,
        rawContent,
      });
    case HfAstNodeType.PARENTHESIS:
      return buildParenthesisAst({
        children: [remapAst(hf, ast.expression, address)],
        rawContent,
      });
    case HfAstNodeType.CELL_REFERENCE:
      return buildCellReferenceAst({
        reference: remapCellAddress(
          hf,
          ast.reference.toSimpleCellAddress(address)
        ),
        rawContent,
      });
    case HfAstNodeType.CELL_RANGE:
      return buildCellRangeReferenceAst({
        start: remapCellAddress(hf, ast.start.toSimpleCellAddress(address)),
        end: remapCellAddress(hf, ast.end.toSimpleCellAddress(address)),
        rawContent,
      });
    case HfAstNodeType.COLUMN_RANGE:
      return buildColumnRangeReferenceAst({
        start: ast.start.col,
        end: ast.end.col,
        rawContent,
      });
    case HfAstNodeType.ROW_RANGE:
      return buildRowRangeReferenceAst({
        start: ast.start.row,
        end: ast.end.row,
        rawContent,
      });
    case HfAstNodeType.ERROR:
      return buildErrorAst({
        error: ast.error.type,
        rawContent,
      });
    case HfAstNodeType.ERROR_WITH_RAW_INPUT:
      return buildErrorAst({
        error: ast.error.type,
        rawContent,
      });
    case HfAstNodeType.ARRAY:
      return buildArrayAst({
        value: ast.args.map((a) => a.map((b) => remapAst(hf, b, address))),
        rawContent,
      });

    default:
      return buildErrorAst({
        error: "AST node type doesn't match any of the case clauses",
        rawContent,
      });
  }
};

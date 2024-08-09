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
import { getOperator } from "./utils";

export const remapAst = (
  hf: HyperFormula,
  ast: HfAst,
  address: SimpleCellAddress
): Ast => {
  // @ts-expect-error we're using protected property here
  const rawContent = hf._unparser.unparse(ast, address).slice(1);

  switch (ast.type) {
    case HfAstNodeType.EMPTY:
      return buildEmptyAst({ value: null, rawContent: "" });
    case HfAstNodeType.NUMBER:
      return buildNumberAst({ value: ast.value, rawContent });
    case HfAstNodeType.STRING:
      return buildStringAst({ value: ast.value, rawContent });
    case HfAstNodeType.MINUS_UNARY_OP:
    case HfAstNodeType.PLUS_UNARY_OP:
    case HfAstNodeType.PERCENT_OP:
      return buildUnaryExpressionAst({
        operator: getOperator(ast.type),
        children: [remapAst(hf, ast.value, address)],
        operatorOnRight: ast.type === HfAstNodeType.PERCENT_OP,
        rawContent,
        requirements: {
          minChildCount: 1,
          maxChildCount: 1,
        },
      });
    case HfAstNodeType.CONCATENATE_OP:
    case HfAstNodeType.EQUALS_OP:
    case HfAstNodeType.NOT_EQUAL_OP:
    case HfAstNodeType.GREATER_THAN_OP:
    case HfAstNodeType.LESS_THAN_OP:
    case HfAstNodeType.GREATER_THAN_OR_EQUAL_OP:
    case HfAstNodeType.LESS_THAN_OR_EQUAL_OP:
    case HfAstNodeType.PLUS_OP:
    case HfAstNodeType.MINUS_OP:
    case HfAstNodeType.TIMES_OP:
    case HfAstNodeType.DIV_OP:
    case HfAstNodeType.POWER_OP:
      return buildBinaryExpressionAst({
        operator: getOperator(ast.type),
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
        requirements: {
          minChildCount: 2,
          maxChildCount: 2,
        },
      });
    case HfAstNodeType.FUNCTION_CALL:
      console.log(
        ast.procedureName,
        hf.getFunctionPlugin(ast.procedureName)?.implementedFunctions[
          ast.procedureName
        ]
      );

      const hfFunction = hf.getFunctionPlugin(ast.procedureName)
        ?.implementedFunctions[ast.procedureName];

      return buildFunctionAst({
        functionName: ast.procedureName,
        children: ast.args.map((i, idx) => remapAst(hf, i, address)),
        rawContent,
        requirements: {
          minChildCount:
            hfFunction?.parameters?.filter(
              (i) => typeof i.defaultValue === "undefined"
            ).length ?? 0,
          maxChildCount: hfFunction?.parameters?.length ?? 0,
        },
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
        requirements: {
          minChildCount: 1,
          maxChildCount: 1,
        },
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
        sheet:
          hf.getSheetName(ast.start.toSimpleCellAddress(address).sheet) ??
          "MISSING",
        rawContent,
      });
    case HfAstNodeType.COLUMN_RANGE:
      return buildColumnRangeReferenceAst({
        start: ast.start.col,
        end: ast.end.col,
        sheet:
          hf.getSheetName(ast.start.toSimpleColumnAddress(address).sheet) ??
          "MISSING",
        rawContent,
      });
    case HfAstNodeType.ROW_RANGE:
      return buildRowRangeReferenceAst({
        start: ast.start.row,
        end: ast.end.row,
        sheet:
          hf.getSheetName(ast.start.toSimpleRowAddress(address).sheet) ??
          "MISSING",
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
        value: ast.args.map((a, idx1) =>
          a.map((b, idx2) => remapAst(hf, b, address))
        ),
        rawContent,
      });

    default:
      return buildErrorAst({
        error: "AST node type doesn't match any of the case clauses",
        rawContent,
      });
  }
};

import * as SheetFlow from "@/libs/sheetflow";
import { HyperFormula, SimpleCellAddress } from "hyperformula";
import { Ast, AstNodeType } from "hyperformula/commonjs/parser";
import { remapCellAddress } from "./remapCellAddress";
import { getOperator } from "./utils";

export const remapAst = (
  hf: HyperFormula,
  ast: Ast,
  address: SimpleCellAddress,
  rootUUID?: string
): SheetFlow.Ast => {
  // @ts-expect-error we're using protected property here
  const rawContent = hf._unparser.unparse(ast, address).slice(1);

  switch (ast.type) {
    case AstNodeType.EMPTY:
      return SheetFlow.buildEmptyAst({
        value: null,
        rawContent: "",
        id: rootUUID,
      });

    case AstNodeType.NUMBER:
      return SheetFlow.buildNumberAst({
        value: ast.value,
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.STRING:
      return SheetFlow.buildStringAst({
        value: ast.value,
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.MINUS_UNARY_OP:
    case AstNodeType.PLUS_UNARY_OP:
    case AstNodeType.PERCENT_OP:
      return SheetFlow.buildUnaryExpressionAst({
        operator: getOperator(ast.type),
        children: [remapAst(hf, ast.value, address)],
        operatorOnRight: ast.type === AstNodeType.PERCENT_OP,
        rawContent,
        id: rootUUID,
        requirements: {
          minChildCount: 1,
          maxChildCount: 1,
        },
      });

    case AstNodeType.CONCATENATE_OP:
    case AstNodeType.EQUALS_OP:
    case AstNodeType.NOT_EQUAL_OP:
    case AstNodeType.GREATER_THAN_OP:
    case AstNodeType.LESS_THAN_OP:
    case AstNodeType.GREATER_THAN_OR_EQUAL_OP:
    case AstNodeType.LESS_THAN_OR_EQUAL_OP:
    case AstNodeType.PLUS_OP:
    case AstNodeType.MINUS_OP:
    case AstNodeType.TIMES_OP:
    case AstNodeType.DIV_OP:
    case AstNodeType.POWER_OP:
      return SheetFlow.buildBinaryExpressionAst({
        operator: getOperator(ast.type),
        children: [
          remapAst(hf, ast.left, address),
          remapAst(hf, ast.right, address),
        ],
        rawContent,
        id: rootUUID,
        requirements: {
          minChildCount: 2,
          maxChildCount: 2,
        },
      });

    case AstNodeType.FUNCTION_CALL:
      console.log(
        ast.procedureName,
        hf.getFunctionPlugin(ast.procedureName)?.implementedFunctions[
          ast.procedureName
        ]
      );

      const hfFunction = hf.getFunctionPlugin(ast.procedureName)
        ?.implementedFunctions[ast.procedureName];

      return SheetFlow.buildFunctionAst({
        functionName: ast.procedureName,
        children: ast.args.map((i, idx) => remapAst(hf, i, address)),
        rawContent,
        id: rootUUID,
        requirements: {
          minChildCount:
            hfFunction?.parameters?.filter(
              (i) => typeof i.defaultValue === "undefined"
            ).length ?? 0,
          maxChildCount: hfFunction?.parameters?.length ?? 0,
        },
      });

    case AstNodeType.NAMED_EXPRESSION:
      return SheetFlow.buildNamedExpressionReferenceAst({
        expressionName: ast.expressionName,
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.PARENTHESIS:
      return SheetFlow.buildParenthesisAst({
        children: [remapAst(hf, ast.expression, address)],
        rawContent,
        id: rootUUID,
        requirements: {
          minChildCount: 1,
          maxChildCount: 1,
        },
      });

    case AstNodeType.CELL_REFERENCE:
      return SheetFlow.buildCellReferenceAst({
        reference: remapCellAddress(
          hf,
          ast.reference.toSimpleCellAddress(address)
        ),
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.CELL_RANGE:
      return SheetFlow.buildCellRangeReferenceAst({
        start: remapCellAddress(hf, ast.start.toSimpleCellAddress(address)),
        end: remapCellAddress(hf, ast.end.toSimpleCellAddress(address)),
        sheet:
          hf.getSheetName(ast.start.toSimpleCellAddress(address).sheet) ??
          "MISSING",
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.COLUMN_RANGE:
      return SheetFlow.buildColumnRangeReferenceAst({
        start: ast.start.col,
        end: ast.end.col,
        sheet:
          hf.getSheetName(ast.start.toSimpleColumnAddress(address).sheet) ??
          "MISSING",
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.ROW_RANGE:
      return SheetFlow.buildRowRangeReferenceAst({
        start: ast.start.row,
        end: ast.end.row,
        sheet:
          hf.getSheetName(ast.start.toSimpleRowAddress(address).sheet) ??
          "MISSING",
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.ERROR:
      return SheetFlow.buildErrorAst({
        error: ast.error.type,
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.ERROR_WITH_RAW_INPUT:
      return SheetFlow.buildErrorAst({
        error: ast.error.type,
        rawContent,
        id: rootUUID,
      });

    case AstNodeType.ARRAY:
      return SheetFlow.buildArrayAst({
        value: ast.args.map((a) => a.map((b) => remapAst(hf, b, address))),
        rawContent,
        id: rootUUID,
      });

    default:
      return SheetFlow.buildErrorAst({
        error: "AST node type doesn't match any of the case clauses",
        rawContent,
        id: rootUUID,
      });
  }
};

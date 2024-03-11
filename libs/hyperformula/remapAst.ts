import {
  Ast,
  AstNodeSubtype,
  AstNodeType,
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
import { areAstEqual, getOperator } from "./utils";

export const remapAst = (
  hf: HyperFormula,
  ast: HfAst,
  address: SimpleCellAddress,
  oldRemappedAst: Ast | undefined = undefined
): Ast => {
  // @ts-expect-error we're using protected property here
  const rawContent = hf._unparser.unparse(ast, address).slice(1);

  const equal =
    oldRemappedAst && areAstEqual(ast, oldRemappedAst, hf, address, false);

  const id = equal ? { id: oldRemappedAst.id } : {};

  const oldChildren =
    equal && oldRemappedAst && "children" in oldRemappedAst
      ? oldRemappedAst.children
      : [oldRemappedAst];

  console.log(equal ? "equal" : "not equal", ast, oldRemappedAst);

  // const oldChildren =
  //   equal && "children" in oldRemappedAst ? oldRemappedAst.children : undefined;

  switch (ast.type) {
    case HfAstNodeType.EMPTY:
      return buildEmptyAst({ ...id, value: null, rawContent: "" });
    case HfAstNodeType.NUMBER:
      return buildNumberAst({ ...id, value: ast.value, rawContent });
    case HfAstNodeType.STRING:
      return buildStringAst({ ...id, value: ast.value, rawContent });
    case HfAstNodeType.MINUS_UNARY_OP:
    case HfAstNodeType.PLUS_UNARY_OP:
    case HfAstNodeType.PERCENT_OP:
      return buildUnaryExpressionAst({
        ...id,
        operator: getOperator(ast.type),
        children: [remapAst(hf, ast.value, address, oldChildren?.[0])],
        operatorOnRight: ast.type === HfAstNodeType.PERCENT_OP,
        rawContent,
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
        ...id,
        operator: getOperator(ast.type),
        children: [
          remapAst(hf, ast.left, address, oldChildren?.[0]),
          remapAst(hf, ast.right, address, oldChildren?.[1]),
        ],
        rawContent,
      });
    case HfAstNodeType.FUNCTION_CALL:
      return buildFunctionAst({
        ...id,
        functionName: ast.procedureName,
        children: ast.args.map((i, idx) =>
          remapAst(hf, i, address, oldChildren?.[idx])
        ),
        rawContent,
      });
    case HfAstNodeType.NAMED_EXPRESSION:
      return buildNamedExpressionReferenceAst({
        ...id,
        expressionName: ast.expressionName,
        rawContent,
      });
    case HfAstNodeType.PARENTHESIS:
      return buildParenthesisAst({
        ...id,
        children: [remapAst(hf, ast.expression, address, oldChildren?.[0])],
        rawContent,
      });
    case HfAstNodeType.CELL_REFERENCE:
      return buildCellReferenceAst({
        ...id,
        reference: remapCellAddress(
          hf,
          ast.reference.toSimpleCellAddress(address)
        ),
        rawContent,
      });
    case HfAstNodeType.CELL_RANGE:
      return buildCellRangeReferenceAst({
        ...id,
        start: remapCellAddress(hf, ast.start.toSimpleCellAddress(address)),
        end: remapCellAddress(hf, ast.end.toSimpleCellAddress(address)),
        sheet:
          hf.getSheetName(ast.start.toSimpleCellAddress(address).sheet) ??
          "MISSING",
        rawContent,
      });
    case HfAstNodeType.COLUMN_RANGE:
      return buildColumnRangeReferenceAst({
        ...id,
        start: ast.start.col,
        end: ast.end.col,
        sheet:
          hf.getSheetName(ast.start.toSimpleColumnAddress(address).sheet) ??
          "MISSING",
        rawContent,
      });
    case HfAstNodeType.ROW_RANGE:
      return buildRowRangeReferenceAst({
        ...id,
        start: ast.start.row,
        end: ast.end.row,
        sheet:
          hf.getSheetName(ast.start.toSimpleRowAddress(address).sheet) ??
          "MISSING",
        rawContent,
      });
    case HfAstNodeType.ERROR:
      return buildErrorAst({
        ...id,
        error: ast.error.type,
        rawContent,
      });
    case HfAstNodeType.ERROR_WITH_RAW_INPUT:
      return buildErrorAst({
        ...id,
        error: ast.error.type,
        rawContent,
      });
    case HfAstNodeType.ARRAY:
      return buildArrayAst({
        ...id,
        value: ast.args.map((a, idx1) =>
          a.map((b, idx2) =>
            remapAst(
              hf,
              b,
              address,
              oldRemappedAst?.type === AstNodeType.VALUE &&
                oldRemappedAst.subtype === AstNodeSubtype.ARRAY
                ? oldRemappedAst.value[idx1][idx2]
                : undefined
            )
          )
        ),
        rawContent,
      });

    default:
      return buildErrorAst({
        ...id,
        error: "AST node type doesn't match any of the case clauses",
        rawContent,
      });
  }
};

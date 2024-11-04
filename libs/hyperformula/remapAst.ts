import * as SheetFlow from "@/libs/sheetflow";
import { HyperFormula, SimpleCellAddress } from "hyperformula";
import { AstNodeType } from "hyperformula/es/parser";
import { Ast } from "hyperformula/typings/parser/Ast";
import { remapCellAddress } from "./remapCellAddress";
import { getOperator } from "./utils";

// WORKAROUND: importing anything from "hyperformula/es/parser/Ast" confuses esbuild
// https://github.com/vitejs/vite/issues/4245
// import { AstNodeType, RangeSheetReferenceType } from "hyperformula/es/parser/Ast";

export const remapAst = (
  hf: HyperFormula,
  ast: Ast,
  address: SimpleCellAddress,
  rootUUID?: string,
  isArrayFormula = false
): SheetFlow.Ast => {
  // @ts-expect-error we're using protected property here
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const rawContent = (hf._unparser.unparse(ast, address) as string).slice(1);
  const { type } = ast;

  const id = rootUUID !== undefined ? { id: rootUUID } : undefined;

  switch (type) {
    case AstNodeType.EMPTY: {
      return SheetFlow.buildEmptyAst({
        value: null,
        rawContent: "",
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.NUMBER: {
      return SheetFlow.buildNumberAst({
        value: ast.value,
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.STRING: {
      return SheetFlow.buildStringAst({
        value: ast.value,
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.MINUS_UNARY_OP:
    case AstNodeType.PLUS_UNARY_OP:
    case AstNodeType.PERCENT_OP: {
      return SheetFlow.buildUnaryExpressionAst({
        operator: getOperator(ast.type),
        children: [remapAst(hf, ast.value, address, undefined, isArrayFormula)],
        operatorOnRight: ast.type === AstNodeType.PERCENT_OP,
        rawContent,
        ...id,
        isArrayFormula,
        requirements: {
          minChildCount: 1,
          maxChildCount: 1,
        },
      });
    }
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
    case AstNodeType.POWER_OP: {
      return SheetFlow.buildBinaryExpressionAst({
        operator: getOperator(ast.type),
        children: [
          remapAst(hf, ast.left, address, undefined, isArrayFormula),
          remapAst(hf, ast.right, address, undefined, isArrayFormula),
        ],
        rawContent,
        ...id,
        isArrayFormula,
        requirements: {
          minChildCount: 2,
          maxChildCount: 2,
        },
      });
    }
    case AstNodeType.FUNCTION_CALL: {
      const hfFunction = hf.getFunctionPlugin(ast.procedureName)
        ?.implementedFunctions[ast.procedureName];

      const arrayFormula =
        isArrayFormula || hfFunction?.method === "arrayformula";

      return SheetFlow.buildFunctionAst({
        functionName: ast.procedureName,
        children: ast.args.map((i) =>
          remapAst(hf, i, address, undefined, arrayFormula)
        ),
        rawContent,
        ...id,
        isArrayFormula: arrayFormula,
        requirements: {
          minChildCount:
            hfFunction?.parameters?.filter(
              (i) => typeof i.defaultValue === "undefined"
            ).length ?? 0,
          maxChildCount: hfFunction?.parameters?.length ?? 0,
        },
      });
    }
    case AstNodeType.NAMED_EXPRESSION: {
      return SheetFlow.buildNamedExpressionReferenceAst({
        expressionName: ast.expressionName,
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.PARENTHESIS: {
      return SheetFlow.buildParenthesisAst({
        children: [
          remapAst(hf, ast.expression, address, undefined, isArrayFormula),
        ],
        rawContent,
        ...id,
        isArrayFormula,
        requirements: {
          minChildCount: 1,
          maxChildCount: 1,
        },
      });
    }
    case AstNodeType.CELL_REFERENCE: {
      return SheetFlow.buildCellReferenceAst({
        reference: remapCellAddress(
          hf,
          ast.reference.toSimpleCellAddress(address)
        ),
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.CELL_RANGE: {
      return SheetFlow.buildCellRangeReferenceAst({
        start: remapCellAddress(hf, ast.start.toSimpleCellAddress(address)),
        end: remapCellAddress(hf, ast.end.toSimpleCellAddress(address)),
        sheet:
          hf.getSheetName(ast.start.toSimpleCellAddress(address).sheet) ??
          "MISSING",
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.COLUMN_RANGE: {
      return SheetFlow.buildColumnRangeReferenceAst({
        start: ast.start.col,
        end: ast.end.col,
        sheet:
          hf.getSheetName(ast.start.toSimpleColumnAddress(address).sheet) ??
          "MISSING",
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.ROW_RANGE: {
      return SheetFlow.buildRowRangeReferenceAst({
        start: ast.start.row,
        end: ast.end.row,
        sheet:
          hf.getSheetName(ast.start.toSimpleRowAddress(address).sheet) ??
          "MISSING",
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.ERROR: {
      return SheetFlow.buildErrorAst({
        error: ast.error.type,
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.ERROR_WITH_RAW_INPUT: {
      return SheetFlow.buildErrorAst({
        error: ast.error.type,
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
    case AstNodeType.ARRAY: {
      return SheetFlow.buildArrayAst({
        value: ast.args.map((a) =>
          a.map((b) => remapAst(hf, b, address, undefined, isArrayFormula))
        ),
        rawContent,
        ...id,
        isArrayFormula,
      });
    }
  }
};

export const ensureReferencesInAstHaveSheetNames = (
  ast: Ast,
  address: SimpleCellAddress
) => {
  const { type } = ast;

  switch (type) {
    case AstNodeType.EMPTY:
    case AstNodeType.NUMBER:
    case AstNodeType.STRING:
    case AstNodeType.NAMED_EXPRESSION:
    case AstNodeType.ERROR:
    case AstNodeType.ERROR_WITH_RAW_INPUT: {
      return ast;
    }
    case AstNodeType.MINUS_UNARY_OP:
    case AstNodeType.PLUS_UNARY_OP:
    case AstNodeType.PERCENT_OP: {
      ast.value = ensureReferencesInAstHaveSheetNames(ast.value, address);
      return ast;
    }
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
    case AstNodeType.POWER_OP: {
      ast.left = ensureReferencesInAstHaveSheetNames(ast.left, address);
      ast.right = ensureReferencesInAstHaveSheetNames(ast.right, address);
      return ast;
    }
    case AstNodeType.FUNCTION_CALL: {
      ast.args = ast.args.map((ast) =>
        ensureReferencesInAstHaveSheetNames(ast, address)
      );
      return ast;
    }
    case AstNodeType.PARENTHESIS: {
      ast.expression = ensureReferencesInAstHaveSheetNames(
        ast.expression,
        address
      );
      return ast;
    }
    case AstNodeType.CELL_REFERENCE: {
      if (ast.reference.sheet === undefined)
        ast.reference = ast.reference.withSheet(address.sheet);
      return ast;
    }
    case AstNodeType.CELL_RANGE:
    case AstNodeType.COLUMN_RANGE:
    case AstNodeType.ROW_RANGE: {
      if (ast.start.sheet === undefined)
        ast.start = ast.start.withSheet(address.sheet);
      if (ast.end.sheet === undefined)
        ast.end = ast.end.withSheet(address.sheet);
      // WORKAROUND: because of the workaround mentioned at the beginning of the file
      ast.sheetReferenceType = 2; // RangeSheetReferenceType.BOTH_ABSOLUTE;
      return ast;
    }
    case AstNodeType.ARRAY: {
      ast.args = ast.args.map((row) =>
        row.map((col) => ensureReferencesInAstHaveSheetNames(col, address))
      );
      return ast;
    }
  }
};

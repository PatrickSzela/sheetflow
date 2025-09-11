import { type HyperFormula, type SimpleCellAddress } from "hyperformula";
import { ArrayPlugin } from "hyperformula/es/interpreter/plugin/ArrayPlugin";
import * as SheetFlow from "@/libs/sheetflow";
import { remapCellAddress } from "./remapCellAddress";
import { AstNodeType, getOperator, type Ast } from "./utils";

export type AstEngineData = {
  isPartOfArrayFormula: boolean;
};

export const remapAst = (
  hf: HyperFormula,
  ast: Ast,
  address: SimpleCellAddress,
  rootUUID?: string,
  isPartOfArrayFormula = false,
): SheetFlow.Ast => {
  const rawContent = hf.unparser.unparse(ast, address).slice(1);
  const { type } = ast;

  const baseData = {
    ...(rootUUID !== undefined ? { id: rootUUID } : undefined),
    rawContent: type === AstNodeType.EMPTY ? "" : rawContent,
    engineData: {
      isPartOfArrayFormula,
    },
  } satisfies Partial<SheetFlow.Ast>;

  switch (type) {
    case AstNodeType.EMPTY: {
      return SheetFlow.buildEmptyAst({
        ...baseData,
        value: null,
      });
    }
    case AstNodeType.NUMBER: {
      return SheetFlow.buildNumberAst({
        ...baseData,
        value: ast.value,
      });
    }
    case AstNodeType.STRING: {
      return SheetFlow.buildStringAst({
        ...baseData,
        value: ast.value,
      });
    }
    case AstNodeType.MINUS_UNARY_OP:
    case AstNodeType.PLUS_UNARY_OP:
    case AstNodeType.PERCENT_OP: {
      return SheetFlow.buildUnaryExpressionAst({
        ...baseData,
        operator: getOperator(ast.type),
        children: [
          remapAst(hf, ast.value, address, undefined, isPartOfArrayFormula),
        ],
        operatorOnRight: ast.type === AstNodeType.PERCENT_OP,
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
        ...baseData,
        operator: getOperator(ast.type),
        children: [
          remapAst(hf, ast.left, address, undefined, isPartOfArrayFormula),
          remapAst(hf, ast.right, address, undefined, isPartOfArrayFormula),
        ],
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
        isPartOfArrayFormula ||
        hfFunction?.method ===
          ArrayPlugin.implementedFunctions["ARRAYFORMULA"].method;

      return SheetFlow.buildFunctionAst({
        ...baseData,
        // `rawContent` contains the translated function name, while `ast.procedureName` is always in English
        functionName: rawContent.split("(")[0],
        children: ast.args.map((i) =>
          remapAst(hf, i, address, undefined, arrayFormula),
        ),
        requirements: {
          minChildCount:
            hfFunction?.parameters?.filter(
              (i) => typeof i.defaultValue === "undefined",
            ).length ?? 0,
          maxChildCount: hfFunction?.parameters?.length ?? 0,
        },
      });
    }
    case AstNodeType.NAMED_EXPRESSION: {
      return SheetFlow.buildNamedExpressionReferenceAst({
        ...baseData,
        expressionName: ast.expressionName,
      });
    }
    case AstNodeType.PARENTHESIS: {
      return SheetFlow.buildParenthesisAst({
        ...baseData,
        children: [
          remapAst(
            hf,
            ast.expression,
            address,
            undefined,
            isPartOfArrayFormula,
          ),
        ],
        requirements: {
          minChildCount: 1,
          maxChildCount: 1,
        },
      });
    }
    case AstNodeType.CELL_REFERENCE: {
      return SheetFlow.buildCellReferenceAst({
        ...baseData,
        reference: remapCellAddress(ast.reference.toSimpleCellAddress(address)),
      });
    }
    case AstNodeType.CELL_RANGE: {
      return SheetFlow.buildCellRangeReferenceAst({
        ...baseData,
        start: remapCellAddress(ast.start.toSimpleCellAddress(address)),
        end: remapCellAddress(ast.end.toSimpleCellAddress(address)),
        sheet: ast.start.toSimpleCellAddress(address).sheet,
      });
    }
    case AstNodeType.COLUMN_RANGE: {
      return SheetFlow.buildColumnRangeReferenceAst({
        ...baseData,
        start: ast.start.col,
        end: ast.end.col,
        sheet: ast.start.toSimpleColumnAddress(address).sheet,
      });
    }
    case AstNodeType.ROW_RANGE: {
      return SheetFlow.buildRowRangeReferenceAst({
        ...baseData,
        start: ast.start.row,
        end: ast.end.row,
        sheet: ast.start.toSimpleRowAddress(address).sheet,
      });
    }
    case AstNodeType.ERROR: {
      return SheetFlow.buildErrorAst({
        ...baseData,
        error: ast.error.type,
      });
    }
    case AstNodeType.ERROR_WITH_RAW_INPUT: {
      return SheetFlow.buildErrorAst({
        ...baseData,
        error: ast.error.type,
      });
    }
    case AstNodeType.ARRAY: {
      return SheetFlow.buildArrayAst({
        ...baseData,
        value: ast.args.map((a) =>
          a.map((b) =>
            remapAst(hf, b, address, undefined, isPartOfArrayFormula),
          ),
        ),
      });
    }
  }
};

export const ensureReferencesInAstHaveSheetNames = (
  ast: Ast,
  address: SimpleCellAddress,
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
        ensureReferencesInAstHaveSheetNames(ast, address),
      );
      return ast;
    }
    case AstNodeType.PARENTHESIS: {
      ast.expression = ensureReferencesInAstHaveSheetNames(
        ast.expression,
        address,
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
      // WORKAROUND: importing anything that's not a type from "hyperformula/es/parser/Ast" confuses esbuild
      // https://github.com/evanw/esbuild/issues/1433
      ast.sheetReferenceType = 2; // RangeSheetReferenceType.BOTH_ABSOLUTE;
      return ast;
    }
    case AstNodeType.ARRAY: {
      ast.args = ast.args.map((row) =>
        row.map((col) => ensureReferencesInAstHaveSheetNames(col, address)),
      );
      return ast;
    }
  }
};

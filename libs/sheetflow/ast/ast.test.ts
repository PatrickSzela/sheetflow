import { describe, expect, test } from "vitest";
import * as Ast from "@/libs/sheetflow/ast";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const createTestData = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, { buildFn: Ast.BuildFn<any> }>,
>(
  tests: T & {
    [K in keyof T]: {
      data: Parameters<T[K]["buildFn"]>[0];
      isFn: (ast: unknown) => ast is ReturnType<T[K]["buildFn"]>;
    };
  },
) => tests;

const astTestData = createTestData({
  empty: {
    buildFn: Ast.buildEmptyAst,
    isFn: Ast.isEmptyAst,
    data: { value: null, rawContent: "" },
  },
  number: {
    buildFn: Ast.buildNumberAst,
    isFn: Ast.isNumberAst,
    data: { value: 1, rawContent: "1" },
  },
  string: {
    buildFn: Ast.buildStringAst,
    isFn: Ast.isStringAst,
    data: { value: "test", rawContent: "test" },
  },
  array: {
    buildFn: Ast.buildArrayAst,
    isFn: Ast.isArrayAst,
    data: {
      value: [
        [
          Ast.buildNumberAst({ value: 1, rawContent: "1" }),
          Ast.buildNumberAst({ value: 2, rawContent: "2" }),
        ],
      ],
      rawContent: "{1,2}",
    },
  },
  cellReference: {
    buildFn: Ast.buildCellReferenceAst,
    isFn: Ast.isCellReferenceAst,
    data: {
      reference: { column: 0, row: 0, sheet: 1 },
      rawContent: "Sheet1!A1",
    },
  },
  cellRangeReference: {
    buildFn: Ast.buildCellRangeReferenceAst,
    isFn: Ast.isCellRangeReferenceAst,
    data: {
      start: { column: 0, row: 0, sheet: 1 },
      end: { column: 1, row: 1, sheet: 1 },
      sheet: 1,
      rawContent: "Sheet1!A1:B2",
    },
  },
  columnRangeReference: {
    buildFn: Ast.buildColumnRangeReferenceAst,
    isFn: Ast.isColumnRangeReferenceAst,
    data: {
      start: 0,
      end: 1,
      sheet: 1,
      rawContent: "Sheet1!A1:B1",
    },
  },
  rowRangeReference: {
    buildFn: Ast.buildRowRangeReferenceAst,
    isFn: Ast.isRowRangeReferenceAst,
    data: {
      start: 0,
      end: 1,
      sheet: 1,
      rawContent: "Sheet1!A1:A2",
    },
  },
  namedExpressionReference: {
    buildFn: Ast.buildNamedExpressionReferenceAst,
    isFn: Ast.isNamedExpressionReferenceAst,
    data: { expressionName: "TEST", rawContent: "TEST" },
  },
  function: {
    buildFn: Ast.buildFunctionAst,
    isFn: Ast.isFunctionAst,
    data: {
      functionName: "TEST",
      children: [Ast.buildNumberAst({ value: 1, rawContent: "1" })],
      rawContent: "TEST(1)",
      requirements: { minChildCount: 1, maxChildCount: 1 },
    },
  },
  unaryExpression: {
    buildFn: Ast.buildUnaryExpressionAst,
    isFn: Ast.isUnaryExpressionAst,
    data: {
      operator: "-",
      operatorOnRight: false,
      children: [Ast.buildNumberAst({ value: 1, rawContent: "1" })],
      rawContent: "-1",
      requirements: { minChildCount: 1, maxChildCount: 1 },
    },
  },
  binaryExpression: {
    buildFn: Ast.buildBinaryExpressionAst,
    isFn: Ast.isBinaryExpressionAst,
    data: {
      operator: "+",
      children: [
        Ast.buildNumberAst({ value: 1, rawContent: "1" }),
        Ast.buildNumberAst({ value: 2, rawContent: "2" }),
      ],
      rawContent: "1+2",
      requirements: { minChildCount: 2, maxChildCount: 2 },
    },
  },
  parenthesis: {
    buildFn: Ast.buildParenthesisAst,
    isFn: Ast.isParenthesisAst,
    data: {
      children: [Ast.buildNumberAst({ value: 1, rawContent: "1" })],
      rawContent: "(1)",
      requirements: { minChildCount: 1, maxChildCount: 1 },
    },
  },
  error: {
    buildFn: Ast.buildErrorAst,
    isFn: Ast.isErrorAst,
    data: {
      error: "TEST",
      rawContent: "TEST",
    },
  },
});

const allIsFns = new Set(
  Object.values(astTestData).flatMap(({ isFn }) => isFn),
).difference(new Set([Ast.isAstWithChildren, Ast.isAstWithValue, Ast.isAst]));

Object.entries(astTestData).forEach(([name, { buildFn, isFn, data }]) => {
  describe(`${name} AST`, () => {
    const ast = (buildFn as (d: typeof data) => ReturnType<typeof buildFn>)(
      data,
    );

    const isAnyOtherAstFns = [...allIsFns.difference(new Set([isFn]))];

    test(`is ${name} AST`, () => {
      expect(isFn(ast)).toEqual(true);
    });

    test("is AST with children", () => {
      expect(Ast.isAstWithChildren(ast)).toEqual("children" in ast);
    });

    test("is AST with value", () => {
      expect(Ast.isAstWithValue(ast)).toEqual("value" in ast);
    });

    test("is any other AST", () => {
      isAnyOtherAstFns.map((isFn) => {
        expect(isFn(ast)).toEqual(false);
      });
    });

    test("contains provided data", () => {
      expect(ast).toMatchObject(data);
    });

    test("has ID that is UUIDv4", () => {
      expect(ast).toHaveProperty("id");
      expect(ast.id).toMatch(UUID_REGEX);
    });

    test(`random data is ${name} AST`, () => {
      expect(isFn(1)).toEqual(false);
      expect(isFn("test")).toEqual(false);
      expect(isFn(null)).toEqual(false);
      expect(isFn(undefined)).toEqual(false);
      expect(isFn(true)).toEqual(false);
      expect(isFn(false)).toEqual(false);
      expect(isFn([1, 2, 3])).toEqual(false);
      expect(isFn({ test: 1 })).toEqual(false);
    });
  });
});

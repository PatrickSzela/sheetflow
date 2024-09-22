import * as SheetFlow from "@/libs/sheetflow";
import { HyperFormula, SimpleCellAddress } from "hyperformula";
import { Ast, AstNodeType } from "hyperformula/es/parser";

export const getOperator = (type: AstNodeType): SheetFlow.Operator => {
  switch (type) {
    case AstNodeType.MINUS_UNARY_OP:
    case AstNodeType.MINUS_OP:
      return "-";
    case AstNodeType.PLUS_UNARY_OP:
    case AstNodeType.PLUS_OP:
      return "+";
    case AstNodeType.PERCENT_OP:
      return "%";
    case AstNodeType.CONCATENATE_OP:
      return "&";
    case AstNodeType.EQUALS_OP:
      return "=";
    case AstNodeType.NOT_EQUAL_OP:
      return "<>";
    case AstNodeType.GREATER_THAN_OP:
      return ">";
    case AstNodeType.LESS_THAN_OP:
      return "<";
    case AstNodeType.GREATER_THAN_OR_EQUAL_OP:
      return ">=";
    case AstNodeType.LESS_THAN_OR_EQUAL_OP:
      return "<=";
    case AstNodeType.TIMES_OP:
      return "*";
    case AstNodeType.DIV_OP:
      return "/";
    case AstNodeType.POWER_OP:
      return "^";
    default:
      throw new Error(`Unknown AST node type \`${type}\``);
  }
};

export const getSheetIdWithError = (hf: HyperFormula, sheetName: string) => {
  const id = hf.getSheetId(sheetName);

  if (typeof id === "undefined") {
    throw new Error(`The sheet \`${sheetName}\` doesn't exists`);
  }

  return id;
};

export const areHfAddressesEqual = (
  hfAddress1: SimpleCellAddress,
  hfAddress2: SimpleCellAddress
) =>
  hfAddress1.col === hfAddress2.col &&
  hfAddress1.row === hfAddress2.row &&
  hfAddress1.sheet === hfAddress2.sheet;

export const areAddressesEqual = (
  hfAddress: SimpleCellAddress,
  sheetflowAddress: SheetFlow.CellAddress,
  hf: HyperFormula
) => {
  const sheetId = getSheetIdWithError(hf, sheetflowAddress.sheet);

  return (
    hfAddress.col === sheetflowAddress.column &&
    hfAddress.row === sheetflowAddress.row &&
    hfAddress.sheet === sheetId
  );
};

export const areAstEqual = (
  hfAst: Ast,
  sheetflowAst: SheetFlow.Ast,
  hf: HyperFormula,
  address: SimpleCellAddress,
  checkChildren: boolean = true
): boolean => {
  const { type } = hfAst;

  switch (type) {
    case AstNodeType.EMPTY:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.VALUE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.EMPTY
      );

    case AstNodeType.NUMBER:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.VALUE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.NUMBER &&
        sheetflowAst.value === hfAst.value
      );

    case AstNodeType.STRING:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.VALUE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.STRING &&
        sheetflowAst.value === hfAst.value
      );

    case AstNodeType.MINUS_UNARY_OP:
    case AstNodeType.PLUS_UNARY_OP:
    case AstNodeType.PERCENT_OP:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.UNARY_EXPRESSION &&
        sheetflowAst.operator === getOperator(hfAst.type) &&
        (checkChildren
          ? areAstEqual(
              hfAst.value,
              sheetflowAst.children[0],
              hf,
              address,
              false
            )
          : true)
      );

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
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.BINARY_EXPRESSION &&
        sheetflowAst.operator === getOperator(hfAst.type) &&
        (checkChildren
          ? areAstEqual(
              hfAst.left,
              sheetflowAst.children[0],
              hf,
              address,
              false
            ) &&
            areAstEqual(
              hfAst.right,
              sheetflowAst.children[1],
              hf,
              address,
              false
            )
          : true)
      );

    case AstNodeType.FUNCTION_CALL:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.FUNCTION &&
        sheetflowAst.functionName === hfAst.procedureName &&
        sheetflowAst.children.length === hfAst.args.length &&
        (checkChildren
          ? !sheetflowAst.children
              .map((i, idx) =>
                areAstEqual(hfAst.args[idx], i, hf, address, false)
              )
              .includes(false)
          : true)
      );

    case AstNodeType.NAMED_EXPRESSION:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.NAMED_EXPRESSION &&
        sheetflowAst.expressionName === hfAst.expressionName
      );

    case AstNodeType.PARENTHESIS:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.PARENTHESIS &&
        (checkChildren
          ? areAstEqual(
              hfAst.expression,
              sheetflowAst.children[0],
              hf,
              address,
              false
            )
          : true)
      );

    case AstNodeType.CELL_REFERENCE:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.CELL &&
        areAddressesEqual(
          hfAst.reference.toSimpleCellAddress(address),
          sheetflowAst.reference,
          hf
        )
      );

    case AstNodeType.CELL_RANGE:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.CELL_RANGE &&
        areAddressesEqual(
          hfAst.start.toSimpleCellAddress(address),
          sheetflowAst.start,
          hf
        ) &&
        areAddressesEqual(
          hfAst.end.toSimpleCellAddress(address),
          sheetflowAst.end,
          hf
        )
      );

    case AstNodeType.COLUMN_RANGE:
      const cStart = hfAst.start.toSimpleColumnAddress(address);
      const cEnd = hfAst.end.toSimpleColumnAddress(address);

      return (
        sheetflowAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.COLUMN_RANGE &&
        cStart.col === sheetflowAst.start &&
        cEnd.col === sheetflowAst.end &&
        cStart.sheet === getSheetIdWithError(hf, sheetflowAst.sheet)
      );

    case AstNodeType.ROW_RANGE:
      const rStart = hfAst.start.toSimpleRowAddress(address);
      const rEnd = hfAst.end.toSimpleRowAddress(address);

      return (
        sheetflowAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.ROW_RANGE &&
        rStart.row === sheetflowAst.start &&
        rEnd.row === sheetflowAst.end &&
        rStart.sheet === getSheetIdWithError(hf, sheetflowAst.sheet)
      );

    case AstNodeType.ERROR:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.ERROR &&
        hfAst.error.type === sheetflowAst.error
      );

    case AstNodeType.ERROR_WITH_RAW_INPUT:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.ERROR &&
        hfAst.error.type === sheetflowAst.error
      );

    case AstNodeType.ARRAY:
      return (
        sheetflowAst.type === SheetFlow.AstNodeType.VALUE &&
        sheetflowAst.subtype === SheetFlow.AstNodeSubtype.ARRAY &&
        !sheetflowAst.value
          .map((i, idx1) =>
            i
              .map((o, idx2) =>
                areAstEqual(hfAst.args[idx1][idx2], o, hf, address, false)
              )
              .flat()
          )
          .flat()
          .includes(false)
      );

    default:
      throw new Error(`Unknown AST node type \`${type}\``);
  }
};

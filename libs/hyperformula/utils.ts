import {
  Ast,
  AstNodeSubtype,
  AstNodeType,
  CellAddress,
} from "@/libs/sheetflow";
import { HyperFormula, SimpleCellAddress } from "hyperformula";
import {
  Ast as HfAst,
  AstNodeType as HfAstNodeType,
} from "hyperformula/commonjs/parser";

export const getOperator = (type: HfAstNodeType) => {
  switch (type) {
    case HfAstNodeType.MINUS_UNARY_OP:
    case HfAstNodeType.MINUS_OP:
      return "-";
    case HfAstNodeType.PLUS_UNARY_OP:
    case HfAstNodeType.PLUS_OP:
      return "+";
    case HfAstNodeType.PERCENT_OP:
      return "%";
    case HfAstNodeType.CONCATENATE_OP:
      return "&";
    case HfAstNodeType.EQUALS_OP:
      return "=";
    case HfAstNodeType.NOT_EQUAL_OP:
      return "<>";
    case HfAstNodeType.GREATER_THAN_OP:
      return ">";
    case HfAstNodeType.LESS_THAN_OP:
      return "<";
    case HfAstNodeType.GREATER_THAN_OR_EQUAL_OP:
      return ">=";
    case HfAstNodeType.LESS_THAN_OR_EQUAL_OP:
      return "<=";
    case HfAstNodeType.TIMES_OP:
      return "*";
    case HfAstNodeType.DIV_OP:
      return "/";
    case HfAstNodeType.POWER_OP:
      return "^";
    default:
      return "";
  }
};

export const areAddressesEqual = (
  hfAddress: SimpleCellAddress,
  address: CellAddress,
  hf: HyperFormula
) => {
  const sheetId = hf.getSheetId(address.sheet);

  if (typeof sheetId === "undefined") {
    console.log("wrong sheet id");
    return false;
  }

  return (
    hfAddress.col === address.column &&
    hfAddress.row === address.row &&
    hfAddress.sheet === sheetId
  );
};

export const areAstEqual = (
  hfAst: HfAst,
  ast: Ast,
  hf: HyperFormula,
  address: SimpleCellAddress,
  checkChildren: boolean = true
): boolean => {
  switch (hfAst.type) {
    case HfAstNodeType.EMPTY:
      return (
        ast.type === AstNodeType.VALUE && ast.subtype === AstNodeSubtype.EMPTY
      );
    case HfAstNodeType.NUMBER:
      return (
        ast.type === AstNodeType.VALUE &&
        ast.subtype === AstNodeSubtype.NUMBER &&
        ast.value === hfAst.value
      );
    case HfAstNodeType.STRING:
      return (
        ast.type === AstNodeType.VALUE &&
        ast.subtype === AstNodeSubtype.STRING &&
        ast.value === hfAst.value
      );
    case HfAstNodeType.MINUS_UNARY_OP:
    case HfAstNodeType.PLUS_UNARY_OP:
    case HfAstNodeType.PERCENT_OP:
      return (
        ast.type === AstNodeType.UNARY_EXPRESSION &&
        ast.operator === getOperator(hfAst.type) &&
        (checkChildren
          ? areAstEqual(hfAst.value, ast.children[0], hf, address, false)
          : true)
      );
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
      return (
        ast.type === AstNodeType.BINARY_EXPRESSION &&
        ast.operator === getOperator(hfAst.type) &&
        (checkChildren
          ? areAstEqual(hfAst.left, ast.children[0], hf, address, false) &&
            areAstEqual(hfAst.right, ast.children[1], hf, address, false)
          : true)
      );
    case HfAstNodeType.FUNCTION_CALL:
      return (
        ast.type === AstNodeType.FUNCTION &&
        ast.functionName === hfAst.procedureName &&
        ast.children.length === hfAst.args.length &&
        (checkChildren
          ? !ast.children
              .map((i, idx) =>
                areAstEqual(hfAst.args[idx], i, hf, address, false)
              )
              .includes(false)
          : true)
      );
    case HfAstNodeType.NAMED_EXPRESSION:
      return (
        ast.type === AstNodeType.REFERENCE &&
        ast.subtype === AstNodeSubtype.NAMED_EXPRESSION &&
        ast.expressionName === hfAst.expressionName
      );
    case HfAstNodeType.PARENTHESIS:
      return (
        ast.type === AstNodeType.PARENTHESIS &&
        (checkChildren
          ? areAstEqual(hfAst.expression, ast.children[0], hf, address, false)
          : true)
      );
    case HfAstNodeType.CELL_REFERENCE:
      return (
        ast.type === AstNodeType.REFERENCE &&
        ast.subtype === AstNodeSubtype.CELL &&
        areAddressesEqual(
          hfAst.reference.toSimpleCellAddress(address),
          ast.reference,
          hf
        )
      );
    case HfAstNodeType.CELL_RANGE:
      return (
        ast.type === AstNodeType.REFERENCE &&
        ast.subtype === AstNodeSubtype.CELL_RANGE &&
        areAddressesEqual(
          hfAst.start.toSimpleCellAddress(address),
          ast.start,
          hf
        ) &&
        areAddressesEqual(hfAst.end.toSimpleCellAddress(address), ast.end, hf)
      );
    case HfAstNodeType.COLUMN_RANGE:
      const cStart = hfAst.start.toSimpleColumnAddress(address);
      const cEnd = hfAst.end.toSimpleColumnAddress(address);

      return (
        ast.type === AstNodeType.REFERENCE &&
        ast.subtype === AstNodeSubtype.COLUMN_RANGE &&
        cStart.col === ast.start &&
        cEnd.col === ast.end &&
        cStart.sheet === hf.getSheetId(ast.sheet)
      );
    case HfAstNodeType.ROW_RANGE:
      const rStart = hfAst.start.toSimpleRowAddress(address);
      const rEnd = hfAst.end.toSimpleRowAddress(address);

      return (
        ast.type === AstNodeType.REFERENCE &&
        ast.subtype === AstNodeSubtype.ROW_RANGE &&
        rStart.row === ast.start &&
        rEnd.row === ast.end &&
        rStart.sheet === hf.getSheetId(ast.sheet)
      );
    case HfAstNodeType.ERROR:
      return ast.type === AstNodeType.ERROR && hfAst.error.type === ast.error;
    case HfAstNodeType.ERROR_WITH_RAW_INPUT:
      return ast.type === AstNodeType.ERROR && hfAst.error.type === ast.error;
    case HfAstNodeType.ARRAY:
      return (
        ast.type === AstNodeType.VALUE &&
        ast.subtype === AstNodeSubtype.ARRAY &&
        !ast.value
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
      return false;
  }
};

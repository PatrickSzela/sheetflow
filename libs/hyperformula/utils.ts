import {
  HyperFormula,
  type RawTranslationPackage,
  type SimpleCellAddress,
} from "hyperformula";
import { FormulaVertex } from "hyperformula/es/DependencyGraph/FormulaCellVertex";
import { AstNodeType, type Ast } from "hyperformula/es/parser";
import * as Languages from "hyperformula/i18n/languages";
import * as SheetFlow from "@/libs/sheetflow";

export { AstNodeType, FormulaVertex, type Ast };

export const registerAllLanguages = () => {
  const langs = HyperFormula.getRegisteredLanguagesCodes();

  for (const [lang, pack] of Object.entries(Languages).filter(
    ([lang]) => !langs.includes(lang),
  )) {
    HyperFormula.registerLanguage(lang, pack as RawTranslationPackage);
  }
};

// this is a bit hacky, but it beats having to specify the type and satisfy TS & eslint every time we access these private properties
export const enhancePrototype = () => {
  for (const key of ["parser", "unparser"]) {
    if (!Object.prototype.hasOwnProperty.call(HyperFormula.prototype, key)) {
      Object.defineProperty(HyperFormula.prototype, key, {
        get: function () {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
          return this[`_${key}`];
        },
      });
    }
  }
};

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

export const getOptionalSheetIdWithError = (
  hf: HyperFormula,
  sheetName?: string,
) => {
  return sheetName === undefined
    ? undefined
    : getSheetIdWithError(hf, sheetName);
};

export const areHfAddressesEqual = (
  hfAddress1: SimpleCellAddress,
  hfAddress2: SimpleCellAddress,
) =>
  hfAddress1.col === hfAddress2.col &&
  hfAddress1.row === hfAddress2.row &&
  hfAddress1.sheet === hfAddress2.sheet;

export const areAddressesEqual = (
  hfAddress: SimpleCellAddress,
  sheetflowAddress: SheetFlow.CellAddress,
  hf: HyperFormula,
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
  sfAst: SheetFlow.Ast,
  hf: HyperFormula,
  address: SimpleCellAddress,
  checkChildren = true,
): boolean => {
  const { type } = hfAst;

  switch (type) {
    case AstNodeType.EMPTY: {
      return (
        sfAst.type === SheetFlow.AstNodeType.VALUE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.EMPTY
      );
    }
    case AstNodeType.NUMBER: {
      return (
        sfAst.type === SheetFlow.AstNodeType.VALUE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.NUMBER &&
        sfAst.value === hfAst.value
      );
    }
    case AstNodeType.STRING: {
      return (
        sfAst.type === SheetFlow.AstNodeType.VALUE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.STRING &&
        sfAst.value === hfAst.value
      );
    }
    case AstNodeType.MINUS_UNARY_OP:
    case AstNodeType.PLUS_UNARY_OP:
    case AstNodeType.PERCENT_OP: {
      return (
        sfAst.type === SheetFlow.AstNodeType.UNARY_EXPRESSION &&
        sfAst.operator === getOperator(hfAst.type) &&
        (checkChildren
          ? areAstEqual(hfAst.value, sfAst.children[0], hf, address, false)
          : true)
      );
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
      return (
        sfAst.type === SheetFlow.AstNodeType.BINARY_EXPRESSION &&
        sfAst.operator === getOperator(hfAst.type) &&
        (checkChildren
          ? areAstEqual(hfAst.left, sfAst.children[0], hf, address, false) &&
            areAstEqual(hfAst.right, sfAst.children[1], hf, address, false)
          : true)
      );
    }
    case AstNodeType.FUNCTION_CALL: {
      return (
        sfAst.type === SheetFlow.AstNodeType.FUNCTION &&
        sfAst.functionName === hfAst.procedureName &&
        sfAst.children.length === hfAst.args.length &&
        (checkChildren
          ? !sfAst.children
              .map((i, idx) =>
                areAstEqual(hfAst.args[idx], i, hf, address, false),
              )
              .includes(false)
          : true)
      );
    }
    case AstNodeType.NAMED_EXPRESSION: {
      return (
        sfAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.NAMED_EXPRESSION &&
        sfAst.expressionName === hfAst.expressionName
      );
    }
    case AstNodeType.PARENTHESIS: {
      return (
        sfAst.type === SheetFlow.AstNodeType.PARENTHESIS &&
        (checkChildren
          ? areAstEqual(hfAst.expression, sfAst.children[0], hf, address, false)
          : true)
      );
    }
    case AstNodeType.CELL_REFERENCE: {
      return (
        sfAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.CELL &&
        areAddressesEqual(
          hfAst.reference.toSimpleCellAddress(address),
          sfAst.reference,
          hf,
        )
      );
    }
    case AstNodeType.CELL_RANGE: {
      return (
        sfAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.CELL_RANGE &&
        areAddressesEqual(
          hfAst.start.toSimpleCellAddress(address),
          sfAst.start,
          hf,
        ) &&
        areAddressesEqual(hfAst.end.toSimpleCellAddress(address), sfAst.end, hf)
      );
    }
    case AstNodeType.COLUMN_RANGE: {
      const cStart = hfAst.start.toSimpleColumnAddress(address);
      const cEnd = hfAst.end.toSimpleColumnAddress(address);

      return (
        sfAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.COLUMN_RANGE &&
        cStart.col === sfAst.start &&
        cEnd.col === sfAst.end &&
        cStart.sheet === getSheetIdWithError(hf, sfAst.sheet)
      );
    }
    case AstNodeType.ROW_RANGE: {
      const rStart = hfAst.start.toSimpleRowAddress(address);
      const rEnd = hfAst.end.toSimpleRowAddress(address);

      return (
        sfAst.type === SheetFlow.AstNodeType.REFERENCE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.ROW_RANGE &&
        rStart.row === sfAst.start &&
        rEnd.row === sfAst.end &&
        rStart.sheet === getSheetIdWithError(hf, sfAst.sheet)
      );
    }
    case AstNodeType.ERROR: {
      return (
        sfAst.type === SheetFlow.AstNodeType.ERROR &&
        (hfAst.error.type as string) === sfAst.error
      );
    }
    case AstNodeType.ERROR_WITH_RAW_INPUT: {
      return (
        sfAst.type === SheetFlow.AstNodeType.ERROR &&
        (hfAst.error.type as string) === sfAst.error
      );
    }
    case AstNodeType.ARRAY: {
      return (
        sfAst.type === SheetFlow.AstNodeType.VALUE &&
        sfAst.subtype === SheetFlow.AstNodeSubtype.ARRAY &&
        !sfAst.value
          .map((i, idx1) =>
            i
              .map((o, idx2) =>
                areAstEqual(hfAst.args[idx1][idx2], o, hf, address, false),
              )
              .flat(),
          )
          .flat()
          .includes(false)
      );
    }
  }
};

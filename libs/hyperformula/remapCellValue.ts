import {
  CellValueDetailedType,
  CellValueType,
  DetailedCellError,
  type CellValue,
  type HyperFormula,
  type SimpleCellAddress,
} from "hyperformula";
import * as SheetFlow from "@/libs/sheetflow";

export interface HfCellValueDetails {
  value: CellValue;
  type: CellValueType;
  subtype: CellValueDetailedType;
}

export const getCellValueDetails = (
  hf: HyperFormula,
  address: SimpleCellAddress,
): HfCellValueDetails => ({
  value: hf.getCellValue(address),
  type: hf.getCellValueType(address),
  subtype: hf.getCellValueDetailedType(address),
});

export const remapCellValueDetailedType = (
  subtype: CellValueDetailedType,
): SheetFlow.CellValueSubtype => {
  switch (subtype) {
    case CellValueDetailedType.NUMBER_CURRENCY:
      return SheetFlow.CellValueSubtype.NUMBER_CURRENCY;

    case CellValueDetailedType.NUMBER_DATE:
      return SheetFlow.CellValueSubtype.NUMBER_DATE;

    case CellValueDetailedType.NUMBER_DATETIME:
      return SheetFlow.CellValueSubtype.NUMBER_DATETIME;

    case CellValueDetailedType.NUMBER_PERCENT:
      return SheetFlow.CellValueSubtype.NUMBER_PERCENT;

    case CellValueDetailedType.NUMBER_RAW:
      return SheetFlow.CellValueSubtype.NUMBER_RAW;

    case CellValueDetailedType.NUMBER_TIME:
      return SheetFlow.CellValueSubtype.NUMBER_TIME;

    default:
      throw new Error(`Cannot remap \`${subtype}\` detailed type`);
  }
};

export const remapDetailedCellValue = (
  details: HfCellValueDetails,
): SheetFlow.CellValue => {
  if (
    details.type === CellValueType.BOOLEAN &&
    typeof details.value === "boolean"
  ) {
    return SheetFlow.buildBooleanCellValue({ value: details.value });
  } else if (details.type === CellValueType.EMPTY && details.value === null) {
    return SheetFlow.buildEmptyCellValue({ value: null });
  } else if (
    details.type === CellValueType.ERROR &&
    details.value instanceof DetailedCellError
  ) {
    return SheetFlow.buildErrorCellValue({
      value: details.value.value,
      subtype: details.value.type,
      message: details.value.message,
    });
  } else if (
    details.type === CellValueType.NUMBER &&
    typeof details.value === "number"
  ) {
    return SheetFlow.buildNumberCellValue({
      value: details.value,
      subtype: remapCellValueDetailedType(details.subtype),
    });
  } else if (
    details.type === CellValueType.STRING &&
    typeof details.value === "string"
  ) {
    return SheetFlow.buildStringCellValue({ value: details.value });
  } else {
    throw new Error(
      `Cannot remap type \`${details.type}\` with value \`${JSON.stringify(
        details.value,
      )}\``,
    );
  }
};

const remapCellValueHelper = (value: CellValue): SheetFlow.CellValue => {
  if (value instanceof DetailedCellError) {
    return remapDetailedCellValue({
      type: CellValueType.ERROR,
      subtype: CellValueDetailedType.ERROR,
      value,
    });
  } else {
    return SheetFlow.buildCellValueFromCellContent(value);
  }
};

export const remapCellValue = (
  value: CellValue | CellValue[][],
): SheetFlow.Value => {
  if (Array.isArray(value)) {
    return value.map((row) => row.map((cell) => remapCellValueHelper(cell)));
  } else {
    return remapCellValueHelper(value);
  }
};

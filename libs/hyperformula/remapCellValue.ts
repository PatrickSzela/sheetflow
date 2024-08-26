import {
  CellError,
  DetailedCellError,
  CellValue as HfCellValue,
  CellValueDetailedType as HfCellValueDetailedType,
  CellValueType as HfCellValueType,
  HyperFormula,
  SimpleCellAddress,
} from "hyperformula";
import {
  buildBooleanCellValue,
  buildEmptyCellValue,
  buildErrorCellValue,
  buildNumberCellValue,
  buildStringCellValue,
  CellValue,
  CellValueSubtype,
} from "../sheetflow/cellValue";

export interface HfCellValueDetails {
  value: HfCellValue;
  type: HfCellValueType;
  subtype: HfCellValueDetailedType;
}

export const getCellValueDetails = (
  hf: HyperFormula,
  address: SimpleCellAddress
): HfCellValueDetails => ({
  value: hf.getCellValue(address),
  type: hf.getCellValueType(address),
  subtype: hf.getCellValueDetailedType(address),
});

export const remapCellValueDetailedType = (
  subtype: HfCellValueDetailedType
): CellValueSubtype => {
  switch (subtype) {
    case HfCellValueDetailedType.NUMBER_CURRENCY:
      return CellValueSubtype.NUMBER_CURRENCY;
    case HfCellValueDetailedType.NUMBER_DATE:
      return CellValueSubtype.NUMBER_DATE;
    case HfCellValueDetailedType.NUMBER_DATETIME:
      return CellValueSubtype.NUMBER_DATETIME;
    case HfCellValueDetailedType.NUMBER_PERCENT:
      return CellValueSubtype.NUMBER_PERCENT;
    case HfCellValueDetailedType.NUMBER_RAW:
      return CellValueSubtype.NUMBER_RAW;
    case HfCellValueDetailedType.NUMBER_TIME:
      return CellValueSubtype.NUMBER_TIME;
    default:
      throw new Error(`Cannot remap \`${subtype}\` detailed type`);
  }
};

export const remapCellValue = (details: HfCellValueDetails): CellValue => {
  if (
    details.type === HfCellValueType.BOOLEAN &&
    typeof details.value === "boolean"
  ) {
    return buildBooleanCellValue({ value: details.value });
  } else if (details.type === HfCellValueType.EMPTY && details.value === null) {
    return buildEmptyCellValue({ value: null });
  } else if (
    details.type === HfCellValueType.ERROR &&
    details.value instanceof DetailedCellError
  ) {
    return buildErrorCellValue({
      value: details.value.value,
      subtype: details.value.type,
      message: details.value.message,
    });
  } else if (
    details.type === HfCellValueType.NUMBER &&
    typeof details.value === "number"
  ) {
    return buildNumberCellValue({
      value: details.value,
      subtype: remapCellValueDetailedType(details.subtype),
    });
  } else if (
    details.type === HfCellValueType.STRING &&
    typeof details.value === "string"
  ) {
    return buildStringCellValue({ value: details.value });
  } else {
    throw new Error(
      `Cannot remap type \`${details.type}\` with value \`${details.value}\``
    );
  }
};

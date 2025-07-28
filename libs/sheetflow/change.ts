import { type CellAddress } from "./cellAddress";
import { type Value } from "./cellValue";

export type CellChange = { address: CellAddress; value: Value };
export type NamedExpressionChange = { name: string; value: Value };
export type Change = CellChange | NamedExpressionChange;

export const isCellChange = (change: Change): change is CellChange => {
  return "address" in change && "value" in change;
};

export const isNamedExpressionChange = (
  change: Change,
): change is NamedExpressionChange => {
  return "name" in change && "value" in change;
};

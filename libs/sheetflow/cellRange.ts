import {
  areCellAddressesEqual,
  CellAddress,
  isCellAddress,
} from "./cellAddress";

export interface CellRange {
  start: CellAddress;
  end: CellAddress;
}

export const buildCellRange = (
  start: CellAddress,
  end: CellAddress
): CellRange => ({
  start,
  end,
});

export const isCellRange = (range: any): range is CellRange => {
  const { start, end } = (range ?? {}) as CellRange;
  return isCellAddress(start) && isCellAddress(end);
};

export const areCellRangesEqual = (
  range1: CellRange,
  range2: CellRange
): boolean => {
  return (
    areCellAddressesEqual(range1.start, range2.start) &&
    areCellAddressesEqual(range1.end, range2.end)
  );
};

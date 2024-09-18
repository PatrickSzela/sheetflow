import { CellContent } from "./cell";

export type Sheet = CellContent[][];
export type Sheets = Record<string, Sheet>;

// TODO: come up with a better name
export type CellList = Record<string, CellContent>;

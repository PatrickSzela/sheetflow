import {
  ExportedCellChange,
  type ExportedChange,
  type HyperFormula,
} from "hyperformula";
import { type Change } from "@/libs/sheetflow";
import { type HyperFormulaEngine } from "./hyperformulaEngine";
import { remapCellAddress } from "./remapCellAddress";
import { remapCellValue } from "./remapCellValue";

export const remapChange = (
  engine: HyperFormulaEngine,
  hf: HyperFormula,
  change: ExportedChange,
): Change => {
  if (change instanceof ExportedCellChange) {
    const address = remapCellAddress(hf, change.address);

    return {
      address,
      value: engine.getCellValue(address),
    };
  } else {
    return {
      name: change.name,
      value: remapCellValue(change.newValue),
    };
  }
};

export const remapChanges = (
  engine: HyperFormulaEngine,
  hf: HyperFormula,
  changes: ExportedChange[],
) => {
  return changes.map((change) => remapChange(engine, hf, change));
};

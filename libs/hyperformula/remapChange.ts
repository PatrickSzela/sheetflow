import { ExportedCellChange, type ExportedChange } from "hyperformula";
import { type Change } from "@/libs/sheetflow";
import { type HyperFormulaEngine } from "./hyperformulaEngine";
import { remapCellAddress } from "./remapCellAddress";
import { remapCellValue } from "./remapCellValue";

export const remapChange = (
  engine: HyperFormulaEngine,
  change: ExportedChange,
): Change => {
  if (change instanceof ExportedCellChange) {
    const address = remapCellAddress(change.address);

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
  changes: ExportedChange[],
) => {
  return changes.map((change) => remapChange(engine, change));
};

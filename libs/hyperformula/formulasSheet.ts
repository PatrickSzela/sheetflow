import { HyperFormula, RawCellContent } from "hyperformula";
import { SpecialSheets } from "./HyperFormulaProvider";

export const buildFormulasSheetName = (uuid: string, index: number) =>
  `${SpecialSheets.FORMULAS}_${uuid}_${index}`;

export const getFormulasSheetId = (
  hf: HyperFormula,
  uuid: string,
  index: number
) => {
  const name = buildFormulasSheetName(uuid, index);
  const id = hf.getSheetId(name);

  if (typeof id === "undefined") {
    throw new Error(`The sheet \`${name}\` is missing`);
  }

  return id;
};

export const addFormulaSheet = (
  hf: HyperFormula,
  uuid: string,
  index: number,
  contents?: RawCellContent[][]
) => {
  const sheetName = hf.addSheet(buildFormulasSheetName(uuid, index));
  const sheetId = hf.getSheetId(sheetName);

  if (typeof sheetId === "undefined") {
    throw new Error(`Unable to create sheet with name \`${sheetName}\``);
  }

  if (typeof contents !== "undefined") {
    hf.setSheetContent(sheetId, contents);
  }

  return { sheetName, sheetId };
};

export const updateFormulaSheet = (
  hf: HyperFormula,
  sheetId: number,
  uuid: string,
  index: number,
  contents: RawCellContent[][]
) => {
  const sheetName = buildFormulasSheetName(uuid, index);

  hf.renameSheet(sheetId, sheetName);
  hf.setSheetContent(sheetId, contents);
  
  return { sheetName, sheetId };
};

export const addOrUpdateFormulaSheet = (
  hf: HyperFormula,
  sheetId: number | undefined,
  uuid: string,
  index: number,
  contents: RawCellContent[][]
) => {
  return typeof sheetId === "undefined"
    ? addFormulaSheet(hf, uuid, index, contents)
    : updateFormulaSheet(hf, sheetId, uuid, index, contents);
};

export const removeFormulasSheets = (hf: HyperFormula, uuid: string) => {
  const names = hf.getSheetNames().filter((i) => i.includes(uuid));

  for (const name of names) {
    const sheetId = hf.getSheetId(name);

    if (typeof sheetId === "undefined")
      throw new Error(`Unable to delete sheet with name \`${name}\``);

    hf.removeSheet(sheetId);
  }
};

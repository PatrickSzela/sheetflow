export enum SpecialSheets {
  FORMULAS = "SheetFlow_Formulas",
}

export const buildFormulaSheetName = (uuid: string, index: number) =>
  `${SpecialSheets.FORMULAS}_${uuid}_${index}`;

import type { HyperFormulaConfig } from "@/libs/hyperformula/hyperformulaEngine";
import type { SheetFlowConfig } from "@/libs/sheetflow";

export const remapLanguageCode = (languageCode: string): string => {
  return [languageCode.slice(0, 2), languageCode.slice(2)].join("-");
};

export const unmapLanguageCode = (languageCode: string): string => {
  return languageCode.replace("-", "");
};

export const remapConfig = (config: HyperFormulaConfig): SheetFlowConfig => {
  return {
    language: remapLanguageCode(config.language ?? "enGB"),
  };
};

export const unmapConfig = (config: SheetFlowConfig): HyperFormulaConfig => {
  return {
    language: unmapLanguageCode(config.language),
  };
};

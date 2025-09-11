import * as Languages from "hyperformula/i18n/languages";
import type { HyperFormulaConfig } from "@/libs/hyperformula/hyperformulaEngine";
import type { SheetFlowConfig } from "@/libs/sheetflow";

export const remapLanguageCode = (languageCode: string): string => {
  return [languageCode.slice(0, 2), languageCode.slice(2)].join("-");
};

export const unmapLanguageCode = (languageCode: string) => {
  const lang = languageCode.replace("-", "");

  if (!(lang in Languages)) {
    throw new Error(
      `Language ${languageCode} is not supported by HyperFormula`,
    );
  }

  return lang as keyof Omit<typeof Languages, "default">;
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

import {
  ConfigParams,
  HyperFormula,
  SerializedNamedExpression,
  Sheets,
} from "hyperformula";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useRef,
} from "react";
import * as Languages from "hyperformula/es/i18n/languages";

export const registerAllLanguages = () => {
  const langs = HyperFormula.getRegisteredLanguagesCodes();

  for (const [lang, pack] of Object.entries(Languages).filter(
    ([lang]) => !langs.includes(lang)
  )) {
    HyperFormula.registerLanguage(lang, pack);
  }
};

registerAllLanguages();

export enum SpecialSheets {
  FORMULAS = "SheetFlow_Formulas",
}

export interface HyperFormulaProviderProps {
  sheets?: Sheets;
  configInput?: Partial<ConfigParams>;
  namedExpressions?: SerializedNamedExpression[];
}

const HyperFormulaContext = createContext<HyperFormula | null>(null);

export const HyperFormulaProvider = (
  props: PropsWithChildren<HyperFormulaProviderProps>
) => {
  const { sheets = {}, configInput, namedExpressions, children } = props;

  const prevConfig = useRef<typeof configInput>(configInput);

  const hf = useMemo(() => {
    // TODO: move outside of provider
    const hf = HyperFormula.buildFromSheets(
      { ...sheets, [SpecialSheets.FORMULAS]: [] },
      prevConfig.current,
      namedExpressions
    );

    // TODO: remove
    // @ts-expect-error make HF instance available in browser's console
    window.hf = hf;
    return hf;
  }, [namedExpressions, sheets]);

  if (configInput && prevConfig.current !== configInput) {
    prevConfig.current = configInput;

    hf.updateConfig(configInput);

    console.log("Updated HyperFormula config", configInput);
  }

  return (
    <HyperFormulaContext.Provider value={hf}>
      {children}
    </HyperFormulaContext.Provider>
  );
};

export const useHyperFormula = () => {
  const hf = useContext(HyperFormulaContext);

  if (!hf) throw new Error("Failed to get HyperFormula instance from context");

  return hf;
};

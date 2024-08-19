import {
  ConfigParams,
  HyperFormula,
  SerializedNamedExpression,
  Sheets,
} from "hyperformula";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { SHEETFLOW_FORMULAS } from "./utils";

interface HyperFormulaProviderProps {
  sheets?: Sheets;
  configInput?: Partial<ConfigParams>;
  namedExpressions?: SerializedNamedExpression[];
}

const HyperFormulaContext = createContext<HyperFormula | null>(null);

export const HyperFormulaProvider = (
  props: PropsWithChildren<HyperFormulaProviderProps>
) => {
  const { sheets = {}, configInput, namedExpressions, children } = props;

  const hf = useMemo(() => {
    const hf = HyperFormula.buildFromSheets(
      // TODO: move special sheets to global variable
      { ...sheets, [SHEETFLOW_FORMULAS]: [] },
      configInput,
      namedExpressions
    );

    // TODO: remove
    // @ts-expect-error make HF instance available in browser's console
    window.hf = hf;
    return hf;
  }, [configInput, namedExpressions, sheets]);

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

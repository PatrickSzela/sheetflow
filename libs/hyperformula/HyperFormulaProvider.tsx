import {
  ConfigParams,
  HyperFormula,
  SerializedNamedExpression,
  Sheets,
} from "hyperformula";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";

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

  const hf = useMemo(
    () => HyperFormula.buildFromSheets(sheets, configInput, namedExpressions),
    [configInput, namedExpressions, sheets]
  );

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

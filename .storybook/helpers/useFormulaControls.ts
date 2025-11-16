import { useEffect, useState } from "react";
import { type ArgTypes } from "@storybook/react-vite";
import { useCreatePlacedAst, useSheetFlow } from "@/libs/sheetflow";

export interface FormulaControlsProps {
  formula: string;
  source: string;
}

export const FormulaControlsArgTypes: ArgTypes<FormulaControlsProps> = {
  formula: { type: { name: "string", required: true } },
  source: {
    type: { name: "string", required: true },
    table: { disable: true },
  },
};

export const useFormulaControls = (args: FormulaControlsProps) => {
  const { formula, source } = args;

  const sf = useSheetFlow();

  const [initSource] = useState(() => sf.stringToCellAddress(source));
  const [error, setError] = useState<Error>();

  const { placedAst, updateFormula } = useCreatePlacedAst(initSource);

  useEffect(() => {
    try {
      if (placedAst.data.formula !== formula) {
        updateFormula(formula);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(undefined);
      }
    } catch (e) {
      if (e instanceof Error) setError(e);
      else throw e;
    }
  }, [formula, placedAst.data.formula, updateFormula]);

  return { placedAst, error };
};

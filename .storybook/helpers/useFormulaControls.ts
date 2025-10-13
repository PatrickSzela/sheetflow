import { useEffect, useState } from "react";
import { type ArgTypes } from "@storybook/react-vite";
import { useCreatePlacedAst, useSheetFlow } from "@/libs/sheetflow";

export interface FormulaControlsProps {
  formula: string;
  scope: string;
}

export const FormulaControlsArgTypes: ArgTypes<FormulaControlsProps> = {
  formula: { type: { name: "string", required: true } },
  scope: { type: { name: "string", required: true } },
};

export const useFormulaControls = (args: FormulaControlsProps) => {
  const { formula, scope } = args;

  const sf = useSheetFlow();

  const [[initFormula, initScope]] = useState([formula, scope]);
  const [error, setError] = useState<Error>();

  const { placedAst, updateFormula } = useCreatePlacedAst(
    initFormula,
    sf.getSheetIdWithError(initScope),
  );

  useEffect(() => {
    try {
      if (placedAst.data.formula !== formula) {
        updateFormula(formula, sf.getSheetIdWithError(scope));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(undefined);
      }
    } catch (e) {
      if (e instanceof Error) setError(e);
      else throw e;
    }
  }, [formula, placedAst.data.formula, scope, sf, updateFormula]);

  return { placedAst, error };
};

import { useCreatePlacedAst } from "@/libs/sheetflow";
import { ArgTypes } from "@storybook/react-vite";
import { useEffect, useState } from "react";

export interface FormulaControlsProps {
  formula: string;
  scope: string;
};

export const FormulaControlsArgTypes: ArgTypes<FormulaControlsProps> = {
  formula: { type: { name: "string", required: true } },
  scope: { type: { name: "string", required: true } },
};

export const useFormulaControls = (args: FormulaControlsProps) => {
  const { formula, scope } = args;

  const [[initFormula, initScope]] = useState([formula, scope]);
  const [error, setError] = useState<Error>();

  const { placedAst, updateFormula } = useCreatePlacedAst(
    initFormula,
    initScope
  );

  useEffect(() => {
    try {
      updateFormula(formula, scope);
      setError(undefined);
    } catch (e) {
      if (e instanceof Error) setError(e);
      else throw e;
    }
  }, [formula, scope, updateFormula]);

  return { placedAst, error };
};

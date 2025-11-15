import { useCallback } from "react";
import { useSheetFlow } from "./useSheetFlow";

export const usePlacedAst = (id: string) => {
  const sf = useSheetFlow();

  const updateFormula = useCallback(
    (formula: string, scope: number) => {
      sf.updatePlacedAstWithFormula(id, formula, scope);
    },
    [sf, id],
  );

  return { updateFormula, placedAst: sf.getPlacedAst(id) };
};

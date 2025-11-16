import { useCallback } from "react";
import { useSheetFlow } from "./useSheetFlow";

export const usePlacedAst = (id: string) => {
  const sf = useSheetFlow();

  const updateFormula = useCallback(
    (formula: string) => {
      sf.updatePlacedAstWithFormula(id, formula);
    },
    [sf, id],
  );

  return { updateFormula, placedAst: sf.getPlacedAst(id) };
};

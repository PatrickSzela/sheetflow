import { useCallback } from "react";
import { useSheetFlow } from "./useSheetFlow";

export const usePlacedAst = (uuid: string) => {
  const sf = useSheetFlow();

  const updateFormula = useCallback(
    (formula: string, scope: number) => {
      sf.updatePlacedAstWithFormula(uuid, formula, scope);
    },
    [sf, uuid],
  );

  return { updateFormula, placedAst: sf.getPlacedAst(uuid) };
};

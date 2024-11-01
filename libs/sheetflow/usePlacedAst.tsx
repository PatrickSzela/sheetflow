import { useCallback } from "react";
import { useSheetFlow } from "./SheetFlowProvider";

export const usePlacedAst = (uuid: string) => {
  const sf = useSheetFlow();

  const updateFormula = useCallback(
    (formula: string, scope: string) => {
      sf.updatePlacedAstWithFormula(uuid, formula, scope);
    },
    [sf, uuid]
  );

  return { updateFormula, placedAst: sf.getPlacedAst(uuid) };
};

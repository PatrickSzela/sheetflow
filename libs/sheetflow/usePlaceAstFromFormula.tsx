import { useEffect, useMemo, useState } from "react";
import { PlacedAst } from "./placedAst";
import { useSheetFlow } from "./SheetFlowProvider";

export const usePlaceAstFromFormula = (
  formula: string,
  scope: string
): {
  placedAst?: PlacedAst;
  error?: string;
} => {
  const sf = useSheetFlow();

  const [error, setError] = useState<string>();
  const placedAst = useMemo(() => sf.createPlacedAst(), [sf]);

  useEffect(() => {
    if (!sf.isAstPlaced(placedAst.uuid)) return;

    if (!sf.isFormulaValid(formula)) {
      // TODO: better errors
      setError(`Invalid formula`);
      return;
    }

    sf.updatePlacedAstWithFormula(placedAst.uuid, formula, scope);
    setError(undefined);
  }, [formula, placedAst, scope, sf]);

  return { placedAst, error };
};

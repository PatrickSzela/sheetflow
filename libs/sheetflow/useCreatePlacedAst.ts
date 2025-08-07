import { useMemo, useState } from "react";
import { usePlacedAst } from "./usePlacedAst";
import { useSheetFlow } from "./useSheetFlow";

// TODO: warning when initial args have changed?

export const useCreatePlacedAst = (
  initialFormula?: string,
  initialScope?: number,
) => {
  const sf = useSheetFlow();

  const [initial] = useState(() => ({
    formula: initialFormula,
    scope: initialScope,
  }));

  const createdAst = useMemo(() => {
    return sf.createPlacedAst(initial.formula, initial.scope);
  }, [initial.formula, initial.scope, sf]);

  return usePlacedAst(createdAst.uuid);
};

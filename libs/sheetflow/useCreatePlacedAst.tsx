import { useMemo, useState } from "react";
import { useSheetFlow } from "./SheetFlowProvider";
import { usePlacedAst } from "./usePlacedAst";

// TODO: warning when initial args have changed?

export const useCreatePlacedAst = (
  initialFormula?: string,
  initialScope?: string
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

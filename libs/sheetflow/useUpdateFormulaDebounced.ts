import { useCallback, useRef, useState, useTransition } from "react";
import { useDebouncedCallback } from "@mantine/hooks";
import { type PlacedAst } from "./placedAst";
import { usePlacedAst } from "./usePlacedAst";
import { usePlacedAstData } from "./usePlacedAstData";
import { useSheetFlow } from "./useSheetFlow";

export const useUpdateFormulaDebounced = (
  placedAst: PlacedAst,
  delay = 300,
) => {
  const sf = useSheetFlow();
  const { updateFormula } = usePlacedAst(placedAst.id);
  const { formula } = usePlacedAstData(placedAst);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [internalFormula, setInternalFormula] = useState(formula);

  const [isPending, startTransition] = useTransition();

  const debounce = useDebouncedCallback((formula: string) => {
    startTransition(() => {
      try {
        updateFormula(formula);
        setError(undefined);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else throw e;
      }

      setLoading(false);
    });
  }, delay);

  const update = useCallback(
    (formula: string) => {
      setInternalFormula(formula);

      if (!sf.isFormulaValid(formula)) {
        setError("Invalid formula");
        setLoading(false);
        debounce.cancel();
        return;
      }

      setError(undefined);

      if (placedAst.data.formula === formula) {
        setLoading(false);
        debounce.cancel();
        return;
      }

      setLoading(true);
      debounce(formula);
    },
    [debounce, sf, placedAst],
  );

  return {
    formula: loading || isPending || error ? internalFormula : formula,
    error,
    updateFormula: update,
    loading: loading || isPending,
  };
};

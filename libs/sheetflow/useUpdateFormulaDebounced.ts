import { useSheetFlow } from "@/libs/sheetflow/useSheetFlow";
import { useDebouncedCallback } from "@mantine/hooks";
import { useCallback, useRef, useState, useTransition } from "react";
import { PlacedAst } from "./placedAst";
import { usePlacedAst } from "./usePlacedAst";

export const useUpdateFormulaDebounced = (
  placedAst: PlacedAst,
  delay = 300
) => {
  const sf = useSheetFlow();
  const { updateFormula } = usePlacedAst(placedAst.uuid);

  const lastValid = useRef(placedAst.data.formula);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [formula, setInternalFormula] = useState(placedAst.data.formula);

  const [isPending, startTransition] = useTransition();

  const debounce = useDebouncedCallback((formula: string) => {
    startTransition(() => {
      try {
        updateFormula(formula, placedAst.data.scope);
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
        return;
      } else {
        setError(undefined);
      }

      if (lastValid.current === formula) {
        return;
      }

      lastValid.current = formula;
      setLoading(true);
      debounce(formula);
    },
    [debounce, sf]
  );

  return {
    formula,
    error,
    updateFormula: update,
    loading: loading || isPending,
  };
};

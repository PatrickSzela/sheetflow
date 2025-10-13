import { useEffect, useState } from "react";
import { PlacedAst } from "./placedAst";
import { usePlacedAst } from "./usePlacedAst";
import { useSheetFlow } from "./useSheetFlow";

// TODO: warning when initial args have changed?

let globalPlacedAstTemp: PlacedAst | null;

export const useCreatePlacedAst = (
  initialFormula?: string,
  initialScope?: number,
) => {
  const sf = useSheetFlow();

  // WORKAROUND: this is a temporary workaround for creation of initial placed ast
  // until tabbed interface is implemented where multiple placed ast can coexists.
  // This also means we'll be able to create these in event handlers which will make React very happy :)
  const [createdAst] = useState<PlacedAst>(() => {
    globalPlacedAstTemp ??= sf.createPlacedAst(initialFormula, initialScope);
    return globalPlacedAstTemp;
  });

  useEffect(() => {
    return () => {
      globalPlacedAstTemp = null;
    }
  }, []);

  return usePlacedAst(createdAst.uuid);
};

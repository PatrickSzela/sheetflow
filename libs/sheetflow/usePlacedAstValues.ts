import { useCallback, useSyncExternalStore } from "react";
import {
  type PlacedAst,
  type PlacedAstEvents,
  type PlacedAstValues,
} from "./placedAst";

export const usePlacedAstValues = (placedAst: PlacedAst): PlacedAstValues => {
  const subscribe = useCallback(
    (listener: PlacedAstEvents["valuesChanged"]) => {
      placedAst.on("valuesChanged", listener);

      return () => {
        placedAst.off("valuesChanged", listener);
      };
    },
    [placedAst],
  );

  const getSnapshot = useCallback((): PlacedAstValues => {
    return placedAst.values;
  }, [placedAst]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

import { useCallback, useSyncExternalStore } from "react";
import {
  type PlacedAst,
  type PlacedAstData,
  type PlacedAstEvents,
} from "./placedAst";

export const usePlacedAstData = (placedAst: PlacedAst): PlacedAstData => {
  const subscribe = useCallback(
    (listener: PlacedAstEvents["updated"]) => {
      placedAst.on("updated", listener);

      return () => {
        placedAst.off("updated", listener);
      };
    },
    [placedAst],
  );

  const getSnapshot = useCallback((): PlacedAstData => {
    return placedAst.data;
  }, [placedAst]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

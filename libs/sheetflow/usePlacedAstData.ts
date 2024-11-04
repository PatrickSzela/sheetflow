import { useCallback, useSyncExternalStore } from "react";
import { PlacedAst, PlacedAstData, PlacedAstEvents } from "./placedAst";

export const usePlacedAstData = (placedAst: PlacedAst): PlacedAstData => {
  const subscribe = useCallback(
    (listener: PlacedAstEvents["updated"]) => {
      placedAst.on("updated", listener);

      return () => {
        placedAst.off("updated", listener);
      };
    },
    [placedAst]
  );

  const getSnapshot = useCallback((): PlacedAstData => {
    return placedAst.data;
  }, [placedAst]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

import { useCallback, useSyncExternalStore } from "react";
import {
  type PlacedAst,
  type PlacedAstEvents,
  type PlacedAstFlow,
} from "./placedAst";

export const usePlacedAstFlow = (placedAst: PlacedAst): PlacedAstFlow => {
  const subscribe = useCallback(
    (listener: PlacedAstEvents["flowChanged"]) => {
      placedAst.on("flowChanged", listener);

      return () => {
        placedAst.off("flowChanged", listener);
      };
    },
    [placedAst],
  );

  const getSnapshot = useCallback((): PlacedAstFlow => {
    return placedAst.flow;
  }, [placedAst]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

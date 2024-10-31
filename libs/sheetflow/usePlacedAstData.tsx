import { useCallback, useSyncExternalStore } from "react";
import { PlacedAst, PlacedAstData, PlacedAstEvents } from "./placedAst";
import { usePlacedAst } from "./usePlacedAst";

export const usePlacedAstData = (
  placedAst: PlacedAst | string | undefined
): PlacedAstData | Partial<PlacedAstData> => {
  const uuid = typeof placedAst === "string" ? placedAst : placedAst?.uuid;

  const _placedAst = usePlacedAst(uuid);

  const subscribe = useCallback(
    (listener: PlacedAstEvents["updated"]) => {
      _placedAst?.on("updated", listener);

      return () => {
        _placedAst?.off("updated", listener);
      };
    },
    [_placedAst]
  );

  const getSnapshot = useCallback((): PlacedAstData | undefined => {
    return _placedAst?.data;
  }, [_placedAst]);

  return useSyncExternalStore(subscribe, getSnapshot) ?? {};
};

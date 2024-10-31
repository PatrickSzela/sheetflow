import { useCallback, useSyncExternalStore } from "react";
import { PlacedAst, PlacedAstEvents, PlacedAstValues } from "./placedAst";
import { usePlacedAst } from "./usePlacedAst";

export const usePlacedAstValues = (
  placedAst: PlacedAst | string | undefined
): PlacedAstValues | Partial<PlacedAstValues> => {
  const uuid = typeof placedAst === "string" ? placedAst : placedAst?.uuid;

  const _placedAst = usePlacedAst(uuid);

  const subscribe = useCallback(
    (listener: PlacedAstEvents["valuesChanged"]) => {
      _placedAst?.on("valuesChanged", listener);

      return () => {
        _placedAst?.off("valuesChanged", listener);
      };
    },
    [_placedAst]
  );

  const getSnapshot = useCallback((): PlacedAstValues | undefined => {
    return _placedAst?.values;
  }, [_placedAst]);

  return useSyncExternalStore(subscribe, getSnapshot) ?? {};
};

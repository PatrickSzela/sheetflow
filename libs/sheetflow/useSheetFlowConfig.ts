import { useCallback, useSyncExternalStore } from "react";
import type { SheetFlowConfig, SheetFlowEvents } from "./sheetflowEngine";
import { useSheetFlow } from "./useSheetFlow";

export const useSheetFlowConfig = () => {
  const sf = useSheetFlow();

  const subscribe = useCallback(
    (listener: SheetFlowEvents["configChanged"]) => {
      sf.on("configChanged", listener);

      return () => {
        sf.off("configChanged", listener);
      };
    },
    [sf],
  );

  const getSnapshot = useCallback((): SheetFlowConfig => {
    return sf.getConfig();
  }, [sf]);

  return useSyncExternalStore(subscribe, getSnapshot);
};

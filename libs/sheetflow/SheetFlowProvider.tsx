import { SheetFlow } from "./sheetflow";
import { Sheets } from "./sheet";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export interface SheetFlowProviderProps {
  engine: typeof SheetFlow;
  sheets?: Sheets;
  config?: any;
  // TODO: named expressions, proper engine config type
}

const SheetFlowContext = createContext<SheetFlow | null>(null);

export const SheetFlowProvider = (
  props: PropsWithChildren<SheetFlowProviderProps>
) => {
  const { engine, sheets = {}, config, children } = props;

  const _engine = useMemo(() => {
    return engine.build(sheets, config);
  }, [config, engine, sheets]);

  return (
    <SheetFlowContext.Provider value={_engine}>
      {children}
    </SheetFlowContext.Provider>
  );
};

export const useSheetFlow = () => {
  const sheetflow = useContext(SheetFlowContext);

  if (!sheetflow)
    throw new Error("Failed to get SheetFlow instance from context");

  return sheetflow;
};

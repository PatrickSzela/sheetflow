import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { NamedExpressions } from "./namedExpression";
import { Sheets } from "./sheet";
import { SheetFlow } from "./sheetflow";

export interface SheetFlowProviderProps {
  engine: typeof SheetFlow;
  sheets?: Sheets;
  namedExpressions?: NamedExpressions;
  config?: any;
  // TODO: proper engine config type
}

const SheetFlowContext = createContext<SheetFlow | null>(null);

export const SheetFlowProvider = (
  props: PropsWithChildren<SheetFlowProviderProps>
) => {
  const { engine, sheets, namedExpressions, config, children } = props;

  const engineInstance = useMemo(() => {
    return engine.build(sheets, namedExpressions, config);
  }, [config, engine, namedExpressions, sheets]);

  return (
    <SheetFlowContext.Provider value={engineInstance}>
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

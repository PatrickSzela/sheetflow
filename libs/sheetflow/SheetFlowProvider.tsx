import { PropsWithChildren, useMemo } from "react";
import { NamedExpressions } from "./namedExpression";
import { Sheets } from "./sheet";
import { SheetFlowContext } from "./SheetFlowContext";
import { SheetFlowEngine } from "./sheetflowEngine";

export interface SheetFlowProviderProps<T extends typeof SheetFlowEngine> {
  engine: T;
  sheets?: Sheets;
  namedExpressions?: NamedExpressions;
  config?: Parameters<T["build"]>[2];
}

export const SheetFlowProvider = <T extends typeof SheetFlowEngine>(
  props: PropsWithChildren<SheetFlowProviderProps<T>>
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

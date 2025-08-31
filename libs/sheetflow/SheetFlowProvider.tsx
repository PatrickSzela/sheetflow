import { useRef, type PropsWithChildren } from "react";
import { SheetFlowContext } from "./SheetFlowContext";
import { type NamedExpressions } from "./namedExpression";
import { type Sheets } from "./sheet";
import { type SheetFlowEngine } from "./sheetflowEngine";

export interface SheetFlowProviderProps<T extends typeof SheetFlowEngine> {
  engine: T;
  sheets?: Sheets;
  namedExpressions?: NamedExpressions;
  config?: Parameters<T["build"]>[2];
}

export const SheetFlowProvider = <T extends typeof SheetFlowEngine>(
  props: PropsWithChildren<SheetFlowProviderProps<T>>,
) => {
  const { engine, sheets, namedExpressions, config, children } = props;

  const engineInstance = useRef<SheetFlowEngine>(null);
  engineInstance.current ??= engine.build(sheets, namedExpressions, config);

  return (
    <SheetFlowContext.Provider value={engineInstance.current}>
      {children}
    </SheetFlowContext.Provider>
  );
};

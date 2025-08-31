import { useMemo } from "react";
import { type ReactRenderer } from "@storybook/react-vite";
import { type DecoratorFunction } from "storybook/internal/types";
import { HyperFormulaEngine } from "@/libs/hyperformula";
import {
  SheetFlowProvider,
  type NamedExpressions,
  type SheetFlowConfig,
  type Sheets,
} from "@/libs/sheetflow";
import { groupPrefixedKeys } from "@/libs/utils";
import { type HfEngineProviderProps } from "./HfEngineProvider.args";

const defaultSheets: Sheets = {};
const defaultNamedExpressions: NamedExpressions = [];
const defaultConfig: Partial<SheetFlowConfig> = {};

export const withHfEngineProvider = (): DecoratorFunction<
  ReactRenderer,
  HfEngineProviderProps
> => {
  return function HfEngineProviderDecorator(Story, c) {
    const { args } = c;

    const { sheetflow: sf, ...rest } = useMemo(
      () => groupPrefixedKeys(args, "sheetflow"),
      [args],
    );

    const [sheets, namedExpressions, config] = useMemo(() => {
      const sheets: Sheets = { ...defaultSheets, ...sf.sheets };
      const namedExpressions: NamedExpressions = [
        ...defaultNamedExpressions,
        ...(sf.namedExpressions ?? []),
      ];
      const config: Partial<SheetFlowConfig> = {
        ...defaultConfig,
        ...sf.config,
      };

      return [sheets, namedExpressions, config];
    }, [sf.config, sf.namedExpressions, sf.sheets]);

    return (
      <SheetFlowProvider
        engine={HyperFormulaEngine}
        config={config}
        namedExpressions={namedExpressions}
        sheets={sheets}
      >
        <Story args={rest} />
      </SheetFlowProvider>
    );
  };
};

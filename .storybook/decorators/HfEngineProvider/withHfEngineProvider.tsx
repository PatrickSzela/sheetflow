import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import { NamedExpressions, SheetFlowProvider, Sheets } from "@/libs/sheetflow";
import { groupPrefixedKeys } from "@/libs/utils";
import { ReactRenderer } from "@storybook/react";
import { DecoratorFunction } from "@storybook/types";
import { useMemo } from "react";
import { HfEngineProviderProps } from "./HfEngineProvider.args";

const defaultSheets: Sheets = {};
const defaultNamedExpressions: NamedExpressions = [];
const defaultConfig = {
  licenseKey: "gpl-v3",
  language: "enUS",
} satisfies HyperFormulaConfig;

export const withHfEngineProvider = (): DecoratorFunction<
  ReactRenderer,
  HfEngineProviderProps
> => {
  return function HfEngineProviderDecorator(Story, c) {
    const { args } = c;

    const { sheetflow: sf, ...rest } = useMemo(
      () => groupPrefixedKeys(args, "sheetflow"),
      [args]
    );

    const [sheets, namedExpressions, config] = useMemo(() => {
      const sheets: Sheets = { ...defaultSheets, ...sf.sheets };
      const namedExpressions: NamedExpressions = [
        ...defaultNamedExpressions,
        ...(sf.namedExpressions ?? []),
      ];
      const config: HyperFormulaConfig = {
        ...defaultConfig,
        ...sf.config,
        language: sf.language ?? defaultConfig.language,
      };

      return [sheets, namedExpressions, config];
    }, [sf.config, sf.language, sf.namedExpressions, sf.sheets]);

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

import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import { NamedExpressions, SheetFlowProvider, Sheets } from "@/libs/sheetflow";
import { groupPrefixedKeys, prefixKeys, PrefixKeys } from "@/libs/utils";
import { ArgTypes, ReactRenderer } from "@storybook/react";
import { DecoratorFunction } from "@storybook/types";
import * as Languages from "hyperformula/es/i18n/languages";
import { useMemo } from "react";
import { preparePrefixedArgTypes } from "./utils";

type Props = {
  language?: string;
  sheets?: Sheets;
  namedExpressions?: NamedExpressions;
  config?: HyperFormulaConfig;
};

export type HfEngineProviderProps = PrefixKeys<Props, "sheetflow">;

const defaultSheets: Sheets = {};
const defaultNamedExpressions: NamedExpressions = [];
const defaultConfig = {
  licenseKey: "gpl-v3",
  language: "enUS",
} satisfies HyperFormulaConfig;

const argTypes: Partial<ArgTypes<Props>> = {
  language: {
    control: "select",
    options: Object.keys(Languages),
  },
  config: { control: { type: "object" } },
  namedExpressions: { control: { type: "object" } },
  sheets: { control: { type: "object" } },
};
export const HfEngineProviderArgTypes = preparePrefixedArgTypes(
  argTypes,
  "sheetflow"
);

const args: Partial<Props> = {
  sheets: { Sheet1: [] },
  namedExpressions: [],
};
export const HfEngineProviderArgs = prefixKeys(args, "sheetflow");

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

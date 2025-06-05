import { HyperFormulaConfig } from "@/libs/hyperformula";
import { NamedExpressions, Sheets } from "@/libs/sheetflow";
import { prefixKeys, PrefixKeys } from "@/libs/utils";
import { ArgTypes } from "@storybook/react-vite";
import * as Languages from "hyperformula/es/i18n/languages";
import { preparePrefixedArgTypes } from "../utils";

// args
type Props = {
  language?: string;
  sheets?: Sheets;
  namedExpressions?: NamedExpressions;
  config?: HyperFormulaConfig;
};

export type HfEngineProviderProps = PrefixKeys<Props, "sheetflow">;

const args: Partial<Props> = {
  sheets: { Sheet1: [] },
  namedExpressions: [],
};

export const HfEngineProviderArgs = prefixKeys(args, "sheetflow");

// argTypes
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

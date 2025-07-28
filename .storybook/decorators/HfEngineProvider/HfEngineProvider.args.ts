import { type ArgTypes } from "@storybook/react-vite";
import * as Languages from "hyperformula/i18n/languages";
import { type HyperFormulaConfig } from "@/libs/hyperformula";
import { type NamedExpressions, type Sheets } from "@/libs/sheetflow";
import { prefixKeys, type PrefixKeys } from "@/libs/utils";
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
  "sheetflow",
);

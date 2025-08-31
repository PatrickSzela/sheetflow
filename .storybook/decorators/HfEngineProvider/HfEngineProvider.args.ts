import { type ArgTypes } from "@storybook/react-vite";
import * as Languages from "hyperformula/i18n/languages";
import { remapLanguageCode } from "@/libs/hyperformula";
import {
  type NamedExpressions,
  type SheetFlowConfig,
  type Sheets,
} from "@/libs/sheetflow";
import { prefixKeys, type PrefixKeys } from "@/libs/utils";
import { preparePrefixedArgTypes } from "../utils";

// args
type Props = {
  language?: string;
  sheets?: Sheets;
  namedExpressions?: NamedExpressions;
  config?: SheetFlowConfig;
};

export type HfEngineProviderProps = PrefixKeys<Props, "sheetflow">;

const args: Partial<Props> = {
  sheets: { Sheet1: [] },
  namedExpressions: [],
};

export const HfEngineProviderArgs = prefixKeys(args, "sheetflow");

// argTypes
const argTypes: Partial<ArgTypes<Props>> = {
  // TODO: restore ability to set these settings in Storybook's UI
  language: {
    control: { type: "select", disable: true },
    options: Object.keys(Languages).map(remapLanguageCode),
  },
  config: { control: { type: "object", disable: true } },
  namedExpressions: { control: { type: "object", disable: true } },
  sheets: { control: { type: "object", disable: true } },
};

export const HfEngineProviderArgTypes = preparePrefixedArgTypes(
  argTypes,
  "sheetflow",
);

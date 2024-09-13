import {
  getSheetIdWithError,
  HyperFormulaProvider,
  useHyperFormula,
} from "@/libs/hyperformula";
import { getCellLists } from "@/libs/sheetflow";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfigParams, Sheets, SimpleCellAddress } from "hyperformula";
import * as Languages from "hyperformula/es/i18n/languages";
import { useMemo } from "react";
import {
  DependenciesEditor,
  DependenciesEditorProps,
} from "./DependenciesEditor";

// TODO: share stuff between stories

const options: Partial<ConfigParams> = {
  licenseKey: "gpl-v3",
  language: "enUS",
};

const sheets: Sheets = {
  Sheet1: [
    [1, 2, 3],
    ["=1+2+3", "=A1+A2+A3"],
  ],
};

interface DependenciesEditorFromStringProps
  extends Omit<DependenciesEditorProps, "cells"> {
  language: string;
}

const DependenciesEditorFromString =
  ({}: DependenciesEditorFromStringProps) => {
    const hf = useHyperFormula();
    const sheets = getCellLists(hf.getAllSheetsSerialized());

    return (
      <div style={{ height: "100vh" }}>
        <DependenciesEditor
          cells={sheets}
          onChange={(address, value) => {
            const addr: SimpleCellAddress = {
              col: address.column,
              row: address.row,
              sheet: getSheetIdWithError(hf, address.sheet),
            };

            hf.setCellContents(addr, value);
          }}
        />
      </div>
    );
  };

const meta = {
  title: "Formula",
  component: DependenciesEditorFromString,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, c) => {
      const config = useMemo<Partial<ConfigParams>>(
        () => ({
          ...options,
          language: c.args.language,
        }),
        [c.args.language]
      );

      return (
        <HyperFormulaProvider sheets={sheets} configInput={config}>
          <Story />
        </HyperFormulaProvider>
      );
    },
  ],
} satisfies Meta<DependenciesEditorFromStringProps>;

type Story = StoryObj<typeof meta>;

export const DependenciesEditorStory: Story = {
  name: "Dependencies Editor",
  args: {
    language: "enUS",
  },
  argTypes: {
    language: {
      control: "select",
      options: Object.keys(Languages),
    },
  },
};

export default meta;

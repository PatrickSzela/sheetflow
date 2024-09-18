import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import {
  SheetFlowProvider,
  Sheets,
  useSheetFlow,
} from "@/libs/sheetflow";
import type { Meta, StoryObj } from "@storybook/react";
import * as Languages from "hyperformula/es/i18n/languages";
import { useMemo } from "react";
import {
  DependenciesEditor,
  DependenciesEditorProps,
} from "./DependenciesEditor";

// TODO: share stuff between stories

const options: HyperFormulaConfig = {
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
    const sf = useSheetFlow();
    const sheets = sf.getCellLists();

    return (
      <div style={{ height: "100vh" }}>
        <DependenciesEditor
          cells={sheets}
          onChange={(address, value) => {
            sf.setCell(sf.stringToCellAddress(address), value);
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
      const config = useMemo<HyperFormulaConfig>(
        () => ({
          ...options,
          language: c.args.language,
        }),
        [c.args.language]
      );

      return (
        <SheetFlowProvider
          engine={HyperFormulaEngine}
          sheets={sheets}
          config={config}
        >
          <Story />
        </SheetFlowProvider>
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

import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import {
  groupReferencesBySheet,
  NamedExpressions,
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
  Sheet2: [[4, 5, 6]],
};

const namedExpressions: NamedExpressions = [
  {
    name: "Number",
    expression: "123",
  },
  {
    name: "String",
    expression: "text",
  },
];

interface DependenciesEditorFromStringProps
  extends Omit<DependenciesEditorProps, "cells"> {
  language: string;
}

const DependenciesEditorFromString =
  ({}: DependenciesEditorFromStringProps) => {
    const sf = useSheetFlow();
    const { cells } = groupReferencesBySheet(sf, sf.getCellLists());

    return (
      <div style={{ height: "100vh" }}>
        <DependenciesEditor cells={cells} namedExpressions={namedExpressions} />
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
          namedExpressions={namedExpressions}
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

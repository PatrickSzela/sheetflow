import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import { SheetFlowProvider, Sheets } from "@/libs/sheetflow";
import type { Meta, StoryObj } from "@storybook/react";
import * as Languages from "hyperformula/es/i18n/languages";
import { useMemo } from "react";
import { FormulaEditor, FormulaEditorProps } from "./FormulaEditor";

const options: HyperFormulaConfig = {
  licenseKey: "gpl-v3",
  language: "enUS",
};

const sheets: Sheets = {
  Sheet1: [],
};

interface FormulaEditorFromStringProps
  extends Omit<FormulaEditorProps, "flowProps"> {
  language: string;
  skipParenthesis: boolean;
}

const FormulaEditorFromString = ({
  defaultFormula,
  skipParenthesis,
}: FormulaEditorFromStringProps) => {
  const flowProps: FormulaEditorProps["flowProps"] = useMemo(
    () => ({ skipParenthesis }),
    [skipParenthesis]
  );

  return (
    <div style={{ height: "100vh" }}>
      <FormulaEditor defaultFormula={defaultFormula} flowProps={flowProps} />
    </div>
  );
};

const meta = {
  title: "Formula",
  component: FormulaEditorFromString,
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
} satisfies Meta<FormulaEditorFromStringProps>;

type Story = StoryObj<typeof meta>;

export const FormulaEditorStory: Story = {
  name: "Formula Editor",
  args: {
    defaultFormula:
      "=(PI()*0.5)+(-FLOOR(Sheet1!A1+Sheet1!A2*Sheet1!A3,1)*(1 + 100%))",
    skipParenthesis: true,
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

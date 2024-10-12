import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import {
  SheetFlowProvider,
  SheetFlowProviderProps,
  Sheets,
} from "@/libs/sheetflow";
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
  extends Omit<FormulaEditorProps, "flowProps" | "scope">,
    Omit<SheetFlowProviderProps, "engine"> {
  language: string;
  skipParenthesis: boolean;
  skipValues: boolean;
}

const FormulaEditorFromString = ({
  defaultFormula,
  skipParenthesis,
  skipValues,
}: FormulaEditorFromStringProps) => {
  const flowProps: FormulaEditorProps["flowProps"] = useMemo(
    () => ({ skipParenthesis, skipValues }),
    [skipParenthesis, skipValues]
  );

  return (
    <div style={{ height: "100vh" }}>
      <FormulaEditor
        scope="Sheet1"
        defaultFormula={defaultFormula}
        flowProps={flowProps}
      />
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

      const _sheets = useMemo<Sheets>(
        () => ({
          ...sheets,
          ...c.args.sheets,
        }),
        [c.args.sheets]
      );

      return (
        <SheetFlowProvider
          engine={HyperFormulaEngine}
          sheets={_sheets}
          config={config}
          namedExpressions={c.args.namedExpressions}
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
    skipValues: true,
    language: "enUS",
  },
  argTypes: {
    language: {
      control: "select",
      options: Object.keys(Languages),
    },
  },
};

export const FormulaEditorStoryMix: Story = {
  name: "Formula Editor - Arrays & Named Expressions",
  args: {
    namedExpressions: [
      { name: "NamedExp1st", expression: "={10,20,30;40,50,60;70,80,90}" },
      { name: "NamedExp2nd", expression: "=Sheet1!$A$1:$C$3" },
      { name: "NamedExp3rd", expression: "10" },
    ],
    sheets: {
      Sheet1: [
        [-1, -2, -3],
        [-4, -5, -6],
        [-7, -8, -9],
      ],
    },
    defaultFormula:
      "=ARRAYFORMULA({1,2,3;4,5,6;7,8,9}+Sheet1!A1:C3+NamedExp1st+NamedExp2nd*NamedExp3rd)",
    skipParenthesis: true,
    skipValues: false,
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

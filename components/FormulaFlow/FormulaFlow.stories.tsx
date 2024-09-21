import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import { SheetFlowProvider, Sheets, useFormulaAst } from "@/libs/sheetflow";
import type { Meta, StoryObj } from "@storybook/react";
import * as Languages from "hyperformula/es/i18n/languages";
import { useMemo } from "react";
import { FormulaFlow, FormulaFlowProps } from "./FormulaFlow";

const options: HyperFormulaConfig = {
  licenseKey: "gpl-v3",
  language: "enUS",
};

const sheets: Sheets = {
  Sheet1: [],
};

interface FormulaFlowFromStringProps
  extends Omit<FormulaFlowProps, "ast" | "flatAst" | "values"> {
  formula: string;
  language: string;
}

const FormulaFlowFromString = ({
  formula,
  skipParenthesis,
}: FormulaFlowFromStringProps) => {
  const { flatAst, values, error } = useFormulaAst(formula);

  return (
    <div style={{ height: "100vh" }}>
      <FormulaFlow
        flatAst={flatAst}
        values={values}
        skipParenthesis={skipParenthesis}
      />

      {error ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
};

const meta = {
  title: "Formula",
  component: FormulaFlowFromString,
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
} satisfies Meta<FormulaFlowFromStringProps>;

type Story = StoryObj<typeof meta>;

export const FormulaFlowStory: Story = {
  name: "Formula Flow",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*(1 + 100%))",
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

import { HyperFormulaProvider, useFormulaAst } from "@/libs/hyperformula";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfigParams, Sheets } from "hyperformula";
import { FormulaFlow, FormulaFlowProps } from "./FormulaFlow";

const options: Partial<ConfigParams> = {
  licenseKey: "gpl-v3",
};

const sheets: Sheets = {
  Sheet1: [],
};

interface FormulaFlowFromStringProps
  extends Omit<FormulaFlowProps, "ast" | "flatAst" | "values"> {
  formula: string;
}

const FormulaFlowFromString = ({
  formula,
  skipParenthesis,
}: FormulaFlowFromStringProps) => {
  const { ast, flatAst, values } = useFormulaAst(formula);

  return (
    <div style={{ height: "100vh" }}>
      <FormulaFlow
        ast={ast}
        flatAst={flatAst}
        values={values}
        skipParenthesis={skipParenthesis}
      />
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
    (Story) => (
      <HyperFormulaProvider sheets={sheets} configInput={options}>
        <Story />
      </HyperFormulaProvider>
    ),
  ],
} satisfies Meta<FormulaFlowFromStringProps>;

type Story = StoryObj<typeof meta>;

export const FormulaFlowStory: Story = {
  name: "Formula Flow",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*(1 + 100%))",
    skipParenthesis: true
  },
};

export default meta;

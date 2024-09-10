import { HyperFormulaProvider, useFormulaAst } from "@/libs/hyperformula";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfigParams, Sheets } from "hyperformula";
import { FormulaFlow, FormulaFlowProps } from "./FormulaFlow";
import { useMemo } from "react";
import * as Languages from "hyperformula/es/i18n/languages";

const options: Partial<ConfigParams> = {
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

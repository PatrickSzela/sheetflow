import { HyperFormulaProvider, useFormulaAst } from "@/libs/hyperformula";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfigParams, Sheets } from "hyperformula";
import { AstFlowWrapped } from "./AstFlow";

const options: Partial<ConfigParams> = {
  licenseKey: "gpl-v3",
};

const sheets: Sheets = {
  Sheet1: [],
};

interface AstFlowFromStringProps {
  formula: string;
}

const AstFlowFromString = ({ formula }: AstFlowFromStringProps) => {
  const { ast, flatAst, values } = useFormulaAst(formula);

  return (
    <div style={{ height: "100vh" }}>
      <AstFlowWrapped ast={ast} flatAst={flatAst} values={values} />
    </div>
  );
};

const meta = {
  title: "Components",
  component: AstFlowFromString,
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
} satisfies Meta<AstFlowFromStringProps>;

type Story = StoryObj<typeof meta>;

export const AstFlowStory: Story = {
  name: "AST Flow",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*(1 + 100%))",
  },
};

export default meta;

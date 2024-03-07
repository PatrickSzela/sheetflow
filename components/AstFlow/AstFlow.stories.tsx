import type { Meta, StoryObj } from "@storybook/react";
import { HyperFormulaProvider, useFormulaAst } from "@/libs/hyperformula";
import { AstFlow, AstFlowProps } from "./AstFlow";
import { ConfigParams, Sheets } from "hyperformula";

const options: Partial<ConfigParams> = {
  licenseKey: "gpl-v3",
};

const sheets: Sheets = {
  Sheet1: [],
};

const meta = {
  title: "Components",
  component: AstFlow,
  argTypes: {
    formula: { control: "text" },
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, c) => {
      const ast = useFormulaAst(c.args?.formula ?? "");
      return (
        <div style={{ height: "100vh" }}>
          <Story args={{ ast }} />
        </div>
      );
    },
    (Story) => (
      <HyperFormulaProvider sheets={sheets} configInput={options}>
        <Story />
      </HyperFormulaProvider>
    ),
  ],
} satisfies Meta<AstFlowProps & { formula: string }>;

export default meta;
// type Story = StoryObj<typeof meta & { formula: string }>;
type Story = StoryObj<{ formula: string }>;

export const AstFlowStory: Story = {
  name: "AST Flow",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*(1 + 100%))",
  },
};

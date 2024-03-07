import type { Meta, StoryObj } from "@storybook/react";
import { ConfigParams, Sheets } from "hyperformula";
import { FormulaAstPreview } from "./FormulaAstPreview";
import { HyperFormulaProvider } from "./HyperFormulaProvider";

const options: Partial<ConfigParams> = {
  licenseKey: "gpl-v3",
};

const sheets: Sheets = {
  Sheet1: [],
};

const meta = {
  title: "HyperFormula",
  component: FormulaAstPreview,
  decorators: [
    (Story) => (
      <HyperFormulaProvider sheets={sheets} configInput={options}>
        <Story />
      </HyperFormulaProvider>
    ),
  ],
} satisfies Meta<typeof FormulaAstPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormulaPreview: Story = {
  name: "Formula AST Preview",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*100%)",
  },
};

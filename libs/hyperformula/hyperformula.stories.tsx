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

const meta: Meta<typeof FormulaAstPreview> = {
  title: "HyperFormula",
  component: FormulaAstPreview,
  decorators: [
    (Story) => (
      <HyperFormulaProvider sheets={sheets} configInput={options}>
        <Story />
      </HyperFormulaProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FormulaPreview: Story = {
  name: "Formula AST Preview",
  args: {
    formula: "=FLOOR(A1+A2*A3,1)",
  },
};

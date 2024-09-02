import { HyperFormulaProvider } from "@/libs/hyperformula";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfigParams, Sheets } from "hyperformula";
import { useFormulaAst } from "@/libs/hyperformula";
import { ObjectInspector } from "react-inspector";

interface AstPreviewProps {
  formula?: string;
}

const AstPreview = (props: AstPreviewProps) => {
  const { formula = "" } = props;

  const data = useFormulaAst(formula);

  return <ObjectInspector expandLevel={10} data={data} />;
};

const options: Partial<ConfigParams> = {
  licenseKey: "gpl-v3",
};

const sheets: Sheets = {
  Sheet1: [],
};

const meta = {
  title: "Formula",
  component: AstPreview,
  decorators: [
    (Story) => (
      <HyperFormulaProvider sheets={sheets} configInput={options}>
        <Story />
      </HyperFormulaProvider>
    ),
  ],
} satisfies Meta<AstPreviewProps>;

type Story = StoryObj<typeof meta>;

export const FormulaPreview: Story = {
  name: "Formula AST Preview",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*(1 + 100%))",
  },
};

export default meta;

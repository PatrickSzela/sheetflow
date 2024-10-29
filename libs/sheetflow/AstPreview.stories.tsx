import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import { Sheets, useGenerateAst } from "@/libs/sheetflow";
import { useColorScheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import { ObjectInspector, chromeDark, chromeLight } from "react-inspector";
import { SheetFlowProvider } from "./SheetFlowProvider";

interface AstPreviewProps {
  formula?: string;
}

const AstPreview = (props: AstPreviewProps) => {
  const { formula = "" } = props;

  const data = useGenerateAst(formula, "Sheet1");
  const { mode, systemMode } = useColorScheme();

  const isDarkMode =
    (mode === "system" && systemMode === "dark") || mode === "dark";

  const theme: typeof chromeDark = {
    ...(isDarkMode ? chromeDark : chromeLight),
    BASE_BACKGROUND_COLOR: "transparent",
  };

  return (
    <ObjectInspector
      expandLevel={10}
      data={data}
      theme={theme as any} // workaround for broken types
    />
  );
};

const options: HyperFormulaConfig = {
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
      <SheetFlowProvider
        engine={HyperFormulaEngine}
        sheets={sheets}
        config={options}
      >
        <Story />
      </SheetFlowProvider>
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

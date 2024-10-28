import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import { SheetFlowProvider, Sheets, usePlacedAst } from "@/libs/sheetflow";
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

interface FormulaFlowFromStringProps extends Omit<FormulaFlowProps, "uuid"> {
  formula: string;
  language: string;
}

const FormulaFlowFromString = ({
  formula,
  skipValues,
  skipParenthesis,
}: FormulaFlowFromStringProps) => {
  const { placedAst, error } = usePlacedAst(formula, "Sheet1");

  if (!placedAst?.uuid) return;

  return (
    <div style={{ height: "100vh" }}>
      <FormulaFlow
        uuid={placedAst.uuid}
        skipValues={skipValues}
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

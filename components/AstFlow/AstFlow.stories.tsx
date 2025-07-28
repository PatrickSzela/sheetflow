import React from "react";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import {
  HfEngineProviderArgTypes,
  HfEngineProviderArgs,
  withFullscreen,
  withHfEngineProvider,
  withReactFlowProvider,
  type HfEngineProviderProps,
} from "@/.storybook/decorators";
import {
  FormulaControlsArgTypes,
  useFormulaControls,
  type FormulaControlsProps,
} from "@/.storybook/helpers";
import { useInjectValuesToFlow } from "@/components/FormulaEditor";
import { usePlacedAstData } from "@/libs/sheetflow";
import { AstFlow, type AstFlowProps } from "./AstFlow";

type MetaArgs = FormulaControlsProps & AstFlowProps & HfEngineProviderProps;

const meta = {
  title: "Components/Formula",
  component: AstFlow,
  render: (args) => {
    const { formula, scope, ...rest } = args;

    const { placedAst, error } = useFormulaControls(args);
    const { flatAst } = usePlacedAstData(placedAst);
    const { injectValues } = useInjectValuesToFlow(placedAst);

    return (
      <React.Fragment>
        <AstFlow
          {...rest}
          enhanceGeneratedFlow={injectValues}
          flatAst={flatAst}
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
            {error.message}
          </div>
        ) : null}
      </React.Fragment>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    withFullscreen(),
    withReactFlowProvider(),
    withHfEngineProvider(),
  ],
  argTypes: {
    ...HfEngineProviderArgTypes,
    ...FormulaControlsArgTypes,
    flatAst: { table: { disable: true } },
  },
  args: {
    ...HfEngineProviderArgs,
    flatAst: [],
  },
} satisfies Meta<MetaArgs>;

type Story = StoryObj<typeof meta>;

export const FormulaFlowStory: Story = {
  name: "Flow",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*(1 + 100%))",
    scope: "Sheet1",
  },
};

export default meta;

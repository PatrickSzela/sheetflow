import { withFullscreen } from "@/.storybook/decorators/Fullscreen";
import {
  HfEngineProviderArgTypes,
  HfEngineProviderArgs,
  HfEngineProviderProps,
  withHfEngineProvider,
} from "@/.storybook/decorators/HfEngineProvider";
import { withReactFlowProvider } from "@/.storybook/decorators/ReactFlowProvider";
import {
  FormulaControlsArgTypes,
  FormulaControlsProps,
  useFormulaControls,
} from "@/.storybook/helpers/useFormulaControls";
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { FormulaFlow, FormulaFlowProps } from "./FormulaFlow";

type MetaArgs = FormulaControlsProps & FormulaFlowProps & HfEngineProviderProps;

const meta = {
  title: "Components/Formula",
  component: FormulaFlow,
  render: (args) => {
    const { formula, scope, ...rest } = args;

    const { placedAst, error } = useFormulaControls(args);

    return (
      <React.Fragment>
        <FormulaFlow {...rest} placedAst={placedAst} />

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
    placedAst: { table: { disable: true } },
  },
  args: {
    ...HfEngineProviderArgs,
    placedAst: undefined,
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

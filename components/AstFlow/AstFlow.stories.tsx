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
import { AstFlow, type AstFlowProps } from "./AstFlow";

type MetaArgs = FormulaControlsProps &
  Omit<AstFlowProps, "placedAst"> &
  HfEngineProviderProps;

const AstFlowWrapper = (props: MetaArgs) => {
  const { formula, scope, ...rest } = props;

  const { placedAst, error } = useFormulaControls(props);

  return (
    <React.Fragment>
      <AstFlow {...rest} placedAst={placedAst} />

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
};

const meta = {
  title: "Components/Formula",
  component: AstFlowWrapper,
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
  },
  args: {
    ...HfEngineProviderArgs,
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

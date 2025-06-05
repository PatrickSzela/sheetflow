import {
  MuiThemeColorArgTypes,
  withFullscreen,
  withReactFlowProvider,
} from "@/.storybook/decorators";
import {
  NodeWrapper,
  NodeWrapperArgTypes,
  NodeWrapperProps,
} from "@/.storybook/wrappers";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BaseNode, BaseNodeData } from "./BaseNode";

// FIXME: figure out why `satisfies Meta<MetaArgs>` causes items from BaseNodeData to be ignored...

type MetaArgs = BaseNodeData & NodeWrapperProps;

const meta: Meta<MetaArgs> = {
  title: "Components/Nodes",
  component: NodeWrapper,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withFullscreen(), withReactFlowProvider()],
  args: { node: BaseNode },
  argTypes: {
    ...NodeWrapperArgTypes,
    ...MuiThemeColorArgTypes, // FIXME: figure out why Storybook doesn't infer it...
  },
};

type Story = StoryObj<typeof meta>;

export const BaseNodeStory: Story = {
  name: "Base",
  args: {
    title: "Example node",
    color: "primary",
    highlighted: false,
    icon: "🌈",
    inputs: [{ value: 1, handleId: "0" }, { value: 2 }],
    output: { value: 1, handleId: "2" },
  },
};

export default meta;

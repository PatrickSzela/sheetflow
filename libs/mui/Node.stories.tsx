import { buildNumberAst } from "@/libs/sheetflow";
import type { Meta, StoryObj } from "@storybook/react";
import { Node, NodeProps } from "./Node";

const meta = {
  title: "Components",
  component: Node,
} satisfies Meta<NodeProps>;

type Story = StoryObj<typeof meta>;

export const NodeStory: Story = {
  name: "Node",
  args: {
    id: "",
    data: {
      ast: buildNumberAst({
        value: 10,
        rawContent: "10",
      }),
    },
    position: { x: 0, y: 0 },
  },
};

export default meta;

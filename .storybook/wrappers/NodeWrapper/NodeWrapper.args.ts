import { type ArgTypes } from "@storybook/react-vite";
import { type NodeTypes } from "@xyflow/react";
import { type CommonNodeData } from "@/components/nodes";

export type NodeWrapperProps = CommonNodeData & { node: NodeTypes[string] };

export const NodeWrapperArgTypes: Partial<ArgTypes<NodeWrapperProps>> = {
  node: { table: { disable: true } },
};

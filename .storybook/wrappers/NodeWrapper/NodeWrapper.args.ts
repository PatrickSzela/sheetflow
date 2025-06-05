import { CommonNodeData } from "@/components/nodes";
import { ArgTypes } from "@storybook/react-vite";
import { NodeTypes } from "@xyflow/react";

export type NodeWrapperProps = CommonNodeData & { node: NodeTypes[string] };

export const NodeWrapperArgTypes: Partial<ArgTypes<NodeWrapperProps>> = {
  node: { table: { disable: true } },
};

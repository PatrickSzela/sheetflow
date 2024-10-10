import { useColorScheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
} from "@xyflow/react";
import { useMemo, useRef } from "react";
import { BaseNode, BaseNodeData } from "./BaseNode";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
  base: BaseNode,
};

const generateNodesFromNodeData = (data: BaseNodeData): BaseNode[] => [
  { data, id: "", position: { x: 0, y: 0 }, type: "base" },
];

const BaseNodeWrapper = (props: BaseNodeData) => {
  const { mode, systemMode } = useColorScheme();

  const initialNodes = useMemo<BaseNode[]>(
    () => generateNodesFromNodeData(props),
    [props]
  );
  const [nodes, setNodes, onNodesChange] =
    useNodesState<BaseNode>(initialNodes);
  const prevProps = useRef<BaseNodeData>(props);

  if (prevProps.current !== props) {
    prevProps.current = props;
    setNodes(generateNodesFromNodeData(props));
  }

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      nodeTypes={nodeTypes}
      colorMode={mode ?? systemMode ?? "system"}
      nodesConnectable={false}
      elevateNodesOnSelect
      elevateEdgesOnSelect
      fitView
    >
      <Background />
    </ReactFlow>
  );
};

const meta = {
  title: "Components/Nodes",
  component: BaseNodeWrapper,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ height: "100vh" }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "warning", "info", "success"],
    },
  },
} satisfies Meta<BaseNodeData>;

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

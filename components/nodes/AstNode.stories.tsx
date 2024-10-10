import {
  buildCellAddress,
  buildCellReferenceAst,
  buildCellValueFromCellContent,
  buildEmptyAst,
  buildErrorAst,
  buildFunctionAst,
  buildNumberAst,
  buildStringAst,
} from "@/libs/sheetflow";
import { useColorScheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
} from "@xyflow/react";
import { useMemo, useRef } from "react";
import { AstNode, AstNodeData } from "./AstNode";
import { nodeTypes } from "./index";

import "@xyflow/react/dist/style.css";

const generateNodesFromNodeData = (data: AstNodeData): AstNode[] => [
  { data, id: "", position: { x: 0, y: 0 }, type: "ast" },
];

const AstNodeWrapper = (props: AstNodeData) => {
  const { mode, systemMode } = useColorScheme();

  const initialNodes = useMemo<AstNode[]>(
    () => generateNodesFromNodeData(props),
    [props]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<AstNode>(initialNodes);

  const prevProps = useRef<AstNodeData>(props);

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
  component: AstNodeWrapper,
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
} satisfies Meta<AstNodeData>;

type Story = StoryObj<typeof meta>;

const emptyNodeStoryAst = buildEmptyAst({ value: null, rawContent: "" });
export const EmptyNodeStory: Story = {
  name: "Empty AST",
  args: {
    ast: emptyNodeStoryAst,
    output: {
      value: buildCellValueFromCellContent(emptyNodeStoryAst.value),
      handleId: "0",
    },
  },
};

const numberNodeStoryAst = buildNumberAst({ value: 20, rawContent: "20" });
export const NumberNodeStory: Story = {
  name: "Number AST",
  args: {
    ast: numberNodeStoryAst,
    output: {
      value: buildCellValueFromCellContent(numberNodeStoryAst.value),
      handleId: "0",
    },
  },
};

const stringNodeStoryAst = buildStringAst({
  value: "Text",
  rawContent: "Text",
});
export const StringNodeStory: Story = {
  name: "String AST",
  args: {
    ast: stringNodeStoryAst,
    output: {
      value: buildCellValueFromCellContent(stringNodeStoryAst.value),
      handleId: "0",
    },
  },
};

const cellReferenceNodeStoryAst = buildCellReferenceAst({
  reference: buildCellAddress(0, 0, "Sheet1"),
  rawContent: "Sheet1!A1",
});
export const CellReferenceNodeStory: Story = {
  name: "Cell Reference AST",
  args: {
    ast: cellReferenceNodeStoryAst,
    output: {
      value: buildCellValueFromCellContent(20),
      handleId: "0",
    },
  },
};

export const FunctionNodeStory: Story = {
  name: "Function AST",
  args: {
    ast: buildFunctionAst({
      children: [
        buildNumberAst({ value: 10, rawContent: "10" }),
        buildNumberAst({ value: 20, rawContent: "20" }),
      ],
      functionName: "ADD",
      rawContent: "ADD(10+20)",
      requirements: { minChildCount: 2, maxChildCount: 2 },
    }),
    inputs: [
      { value: buildCellValueFromCellContent(10), handleId: "0" },
      { value: buildCellValueFromCellContent(20), handleId: "1" },
    ],
    output: { value: buildCellValueFromCellContent(30) },
  },
};

export const ErrorNodeStory: Story = {
  name: "Error AST",
  args: {
    ast: buildErrorAst({
      error: "REF",
      rawContent: "#REF!",
    }),
    output: { value: buildCellValueFromCellContent("#REF!") },
  },
};

export default meta;

import {
  HfEngineProviderProps,
  withFullscreen,
  withHfEngineProvider,
  withReactFlowProvider,
} from "@/.storybook/decorators";
import {
  NodeWrapper,
  NodeWrapperArgTypes,
  NodeWrapperProps,
} from "@/.storybook/wrappers";
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
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AstNode, AstNodeData } from "./AstNode";

// FIXME: figure out why `satisfies Meta<MetaArgs>` causes items from AstNodeData to be ignored. This probably has something to do with AstWithChildren...

type MetaArgs = AstNodeData & NodeWrapperProps & HfEngineProviderProps;

const meta: Meta<MetaArgs> = {
  title: "Components/Nodes",
  component: NodeWrapper,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    withFullscreen(),
    withReactFlowProvider(),
    withHfEngineProvider(),
  ],
  args: { node: AstNode },
  argTypes: { ...NodeWrapperArgTypes },
};

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

import { withFullscreen } from "@/.storybook/decorators/Fullscreen";
import {
  HfEngineProviderArgs,
  HfEngineProviderArgTypes,
  HfEngineProviderProps,
  withHfEngineProvider,
} from "@/.storybook/decorators/HfEngineProvider";
import { withReactFlowProvider } from "@/.storybook/decorators/ReactFlowProvider";
import { groupPrefixedKeys, PrefixKeys } from "@/libs/utils";
import type { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";
import { FormulaEditor, FormulaEditorProps } from "./FormulaEditor";

// TODO: fix changing scope not rerendering component

type MetaArgs = { defaultFormula: string } & PrefixKeys<
  Required<FormulaEditorProps>["flowProps"],
  "flowProps"
> &
  FormulaEditorProps &
  HfEngineProviderProps;

const meta = {
  title: "Components/Formula",
  component: FormulaEditor,
  render: ({ flowProps: _, ...args }) => {
    const { flowProps, ...rest } = useMemo(() => {
      return groupPrefixedKeys(args, "flowProps");
    }, [args]);

    return <FormulaEditor flowProps={flowProps} {...rest} />;
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    withFullscreen(),
    withReactFlowProvider(),
    withHfEngineProvider(),
  ],
  args: { ...HfEngineProviderArgs },
  argTypes: {
    ...HfEngineProviderArgTypes,
    flowProps: { table: { disable: true } },
    "flowProps.skipParenthesis": {
      name: "skipParenthesis",
      table: { category: "flow" },
    },
    "flowProps.skipValues": {
      name: "skipValues",
      table: { category: "flow" },
    },
  },
} satisfies Meta<MetaArgs>;

type Story = StoryObj<typeof meta>;

export const FormulaEditorStory: Story = {
  name: "Editor",
  args: {
    defaultFormula: "=(PI()*0.5)+(-FLOOR(A1+A2*A3,1)*(1 + 100%))",
    defaultScope: "Sheet1",

    "flowProps.skipParenthesis": true,
    "flowProps.skipValues": false,
  },
};

export const FormulaEditorStoryArrays: Story = {
  name: "Editor - Arrays & Named Expressions",
  args: {
    defaultFormula:
      "=ARRAYFORMULA({1,2,3;4,5,6;7,8,9}+Sheet1!A1:C3+NamedExp1st+NamedExp2nd*NamedExp3rd)",
    defaultScope: "Sheet1",

    "sheetflow.namedExpressions": [
      { name: "NamedExp1st", expression: "={10,20,30;40,50,60;70,80,90}" },
      { name: "NamedExp2nd", expression: "=Sheet1!$A$1:$C$3" },
      { name: "NamedExp3rd", expression: "10" },
    ],
    "sheetflow.sheets": {
      Sheet1: [
        [-1, -2, -3],
        [-4, -5, -6],
        [-7, -8, -9],
      ],
    },

    "flowProps.skipParenthesis": true,
    "flowProps.skipValues": false,
  },
};

export default meta;

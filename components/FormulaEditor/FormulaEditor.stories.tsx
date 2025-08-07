import { useMemo, useState } from "react";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import {
  HfEngineProviderArgTypes,
  HfEngineProviderArgs,
  withFullscreen,
  withHfEngineProvider,
  withReactFlowProvider,
  type HfEngineProviderProps,
} from "@/.storybook/decorators";
import { useSheetFlow } from "@/libs/sheetflow";
import { groupPrefixedKeys, type PrefixKeys } from "@/libs/utils";
import { FormulaEditor, type FormulaEditorProps } from "./FormulaEditor";

type MetaArgs = { defaultScope: string } & PrefixKeys<
  Required<FormulaEditorProps>["flowProps"],
  "flowProps"
> &
  Omit<FormulaEditorProps, "defaultScope"> &
  HfEngineProviderProps;

const FormulaEditorWrapper = (props: MetaArgs) => {
  const { defaultScope, ...rest } = props;

  const sf = useSheetFlow();

  return (
    <FormulaEditor
      defaultScope={sf.getSheetIdWithError(defaultScope)}
      {...rest}
    />
  );
};

const meta = {
  title: "Components/Formula",
  component: FormulaEditorWrapper,
  render: ({ flowProps: _, ...args }) => {
    const { flowProps, ...rest } = useMemo(() => {
      return groupPrefixedKeys(args, "flowProps");
    }, [args]);

    return <FormulaEditorWrapper flowProps={flowProps} {...rest} />;
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

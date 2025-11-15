import { useMemo } from "react";
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
import { groupPrefixedKeys, type PrefixKeys } from "@/libs/utils";
import { FormulaEditor, type FormulaEditorProps } from "./FormulaEditor";

type MetaArgs = FormulaControlsProps &
  PrefixKeys<Required<FormulaEditorProps>["flowProps"], "flowProps"> &
  Omit<FormulaEditorProps, "placedAst"> &
  HfEngineProviderProps;

const FormulaEditorWrapper = (props: MetaArgs) => {
  const { formula, scope, ...rest } = props;
  const { placedAst } = useFormulaControls(props);

  return <FormulaEditor placedAst={placedAst} {...rest} />;
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
    ...FormulaControlsArgTypes,
    scope: { table: { disable: true } },
    flowProps: { table: { disable: true } },
  },
} satisfies Meta<MetaArgs>;

type Story = StoryObj<typeof meta>;

export const FormulaEditorStory: Story = {
  name: "Editor",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(A1+A2*A3,1)*(1 + 100%))",
    scope: "Sheet1",
  },
};

export const FormulaEditorStoryArrays: Story = {
  name: "Editor - Arrays & Named Expressions",
  args: {
    formula:
      "=ARRAYFORMULA({1,2,3;4,5,6;7,8,9}+Sheet1!A1:C3+NamedExp1st+NamedExp2nd*NamedExp3rd)",
    scope: "Sheet1",

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
  },
};

export default meta;

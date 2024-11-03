import {
  HfEngineProviderArgTypes,
  HfEngineProviderArgs,
  HfEngineProviderProps,
  withHfEngineProvider,
  withReactFlowProvider,
} from "@/.storybook/decorators";
import { groupReferencesBySheet, useSheetFlow } from "@/libs/sheetflow";
import type { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";
import {
  DependenciesEditor,
  DependenciesEditorProps,
} from "./DependenciesEditor";

type MetaArgs = DependenciesEditorProps & HfEngineProviderProps;

const meta = {
  title: "Components/Formula",
  component: DependenciesEditor,
  render: () => {
    const sf = useSheetFlow();

    const { cells, namedExpressions } = useMemo(() => {
      return groupReferencesBySheet(sf, [
        ...sf.getAllNonEmptyCells(),
        ...sf.getAllNamedExpressionNames(),
      ]);
    }, [sf]);

    return (
      <DependenciesEditor cells={cells} namedExpressions={namedExpressions} />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withReactFlowProvider(), withHfEngineProvider()],
  args: { ...HfEngineProviderArgs },
  argTypes: {
    ...HfEngineProviderArgTypes,
    cells: { table: { disable: true } },
    namedExpressions: { table: { disable: true } },
  },
} satisfies Meta<MetaArgs>;

type Story = StoryObj<typeof meta>;

export const DependenciesEditorStory: Story = {
  name: "Dependencies Editor",
  args: {
    "sheetflow.sheets": {
      Sheet1: [
        [1, 2, 3],
        ["=1+2+3", "=A1+A2+A3"],
      ],
      Sheet2: [[4, 5, 6]],
    },
    "sheetflow.namedExpressions": [
      {
        name: "Number",
        expression: "123",
      },
      {
        name: "String",
        expression: "text",
      },
    ],
  },
};

export default meta;

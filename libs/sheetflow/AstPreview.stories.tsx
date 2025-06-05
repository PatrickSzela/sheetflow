import {
  HfEngineProviderArgTypes,
  HfEngineProviderArgs,
  HfEngineProviderProps,
  withHfEngineProvider,
} from "@/.storybook/decorators";
import {
  FormulaControlsArgTypes,
  FormulaControlsProps,
  useFormulaControls,
} from "@/.storybook/helpers";
import {
  ObjectInspectorWrapper,
  ObjectInspectorWrapperProps,
} from "@/.storybook/wrappers";
import type { Meta, StoryObj } from "@storybook/react-vite";

type MetaArgs = FormulaControlsProps &
  ObjectInspectorWrapperProps &
  HfEngineProviderProps;

const meta = {
  title: "Logic/Formula",
  component: ObjectInspectorWrapper,
  render: (args) => {
    const { placedAst, error } = useFormulaControls(args);
    return <ObjectInspectorWrapper data={error ? error.message : placedAst} />;
  },
  decorators: [withHfEngineProvider()],
  argTypes: {
    ...HfEngineProviderArgTypes,
    ...FormulaControlsArgTypes,
    data: { table: { disable: true } },
  },
  args: {
    ...HfEngineProviderArgs,
    data: undefined,
  },
} satisfies Meta<MetaArgs>;

type Story = StoryObj<typeof meta>;

export const FormulaPreview: Story = {
  name: "AST Preview",
  args: {
    formula: "=(PI()*0.5)+(-FLOOR(Sheet1!A1+A2*A3,1)*(1 + 100%))",
    scope: "Sheet1",
  },
};

export default meta;

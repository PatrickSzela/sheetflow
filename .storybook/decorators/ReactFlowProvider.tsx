import { ReactRenderer } from "@storybook/react";
import { DecoratorFunction } from "@storybook/types";
import { ReactFlowProvider } from "@xyflow/react";

export const withReactFlowProvider = (): DecoratorFunction<
  ReactRenderer,
  {}
> => {
  return function ReactFlowProviderDecorator(Story) {
    return (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    );
  };
};

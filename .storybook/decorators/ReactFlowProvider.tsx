import { ReactRenderer } from "@storybook/react-vite";
import { DecoratorFunction } from "storybook/internal/types";
import { ReactFlowProvider } from "@xyflow/react";

export const withReactFlowProvider = (): DecoratorFunction<ReactRenderer> => {
  return function ReactFlowProviderDecorator(Story) {
    return (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    );
  };
};

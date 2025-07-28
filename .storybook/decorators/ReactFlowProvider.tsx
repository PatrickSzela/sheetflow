import { type ReactRenderer } from "@storybook/react-vite";
import { ReactFlowProvider } from "@xyflow/react";
import { type DecoratorFunction } from "storybook/internal/types";

export const withReactFlowProvider = (): DecoratorFunction<ReactRenderer> => {
  return function ReactFlowProviderDecorator(Story) {
    return (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    );
  };
};

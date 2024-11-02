import { ReactRenderer } from "@storybook/react";
import { DecoratorFunction } from "@storybook/types";

export const withFullscreen = (): DecoratorFunction<ReactRenderer, {}> => {
  return function FullscreenDecorator(Story) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", height: "100vh" }}>
        <Story />
      </div>
    );
  };
};

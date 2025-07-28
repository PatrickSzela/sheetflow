import { type ReactRenderer } from "@storybook/react-vite";
import { type DecoratorFunction } from "storybook/internal/types";

export const withFullscreen = (): DecoratorFunction<ReactRenderer> => {
  return function FullscreenDecorator(Story) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", height: "100vh" }}>
        <Story />
      </div>
    );
  };
};

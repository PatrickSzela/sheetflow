import { ReactRenderer } from "@storybook/react-vite";
import { DecoratorFunction } from "storybook/internal/types";
import { MuiThemeProvider } from "./MuiThemeProvider";

export const withMuiThemeProvider = (): DecoratorFunction<ReactRenderer> => {
  return function MuiThemeProviderDecorator(Story) {
    return (
      <MuiThemeProvider>
        <Story />
      </MuiThemeProvider>
    );
  };
};

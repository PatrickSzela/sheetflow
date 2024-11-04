import { ReactRenderer } from "@storybook/react";
import { DecoratorFunction } from "@storybook/types";
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

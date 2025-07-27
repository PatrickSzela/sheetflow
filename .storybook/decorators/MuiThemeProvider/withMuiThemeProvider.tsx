import { ReactRenderer } from "@storybook/react-vite";
import { DecoratorFunction } from "storybook/internal/types";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { MuiThemeProvider } from "./MuiThemeProvider";

export const withMuiThemeProvider = (): DecoratorFunction<ReactRenderer> => {
  return function MuiThemeProviderDecorator(Story, context) {
    return (
      <MuiThemeProvider>
        <ColorSchemeSwitcher context={context} />
        <Story />
      </MuiThemeProvider>
    );
  };
};

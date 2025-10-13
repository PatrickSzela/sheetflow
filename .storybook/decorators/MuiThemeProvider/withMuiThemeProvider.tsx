import { type ReactRenderer } from "@storybook/react-vite";
import { type DecoratorFunction } from "storybook/internal/csf";
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

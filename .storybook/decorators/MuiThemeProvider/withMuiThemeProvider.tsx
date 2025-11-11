import { type ReactRenderer } from "@storybook/react-vite";
import { type DecoratorFunction } from "storybook/internal/csf";
import { ThemeProvider } from "@/libs/mui";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";

export const withMuiThemeProvider = (): DecoratorFunction<ReactRenderer> => {
  return function MuiThemeProviderDecorator(Story, context) {
    return (
      <ThemeProvider>
        <ColorSchemeSwitcher context={context} />
        <Story />
      </ThemeProvider>
    );
  };
};

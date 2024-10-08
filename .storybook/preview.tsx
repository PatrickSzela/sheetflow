import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import React from "react";
import { darkTheme, lightTheme } from "../libs/mui/themes";

const preview: Preview = {
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        Light: lightTheme,
        Dark: darkTheme,
      },
      defaultTheme: (() =>
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "Dark"
          : "Light")(),
      Provider: ThemeProvider,
      GlobalStyles: () => <CssBaseline enableColorScheme />,
    }),
  ],
  parameters: {
    controls: {
      disableSaveFromUI: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

import { ThemeProvider, useColorScheme, CssBaseline } from "@mui/material";
import type { Preview } from "@storybook/react";
import React, { PropsWithChildren, useEffect } from "react";
import { useDarkMode } from "storybook-dark-mode";
import { theme } from "../libs/mui";

// WORKAROUND: `storybook-dark-mode` pinned at version `4.0.1` because of a bug:
// https://github.com/hipstersmoothie/storybook-dark-mode/issues/282

const ColorSchemeSwitcher = () => {
  const isStorybookInDarkMode = useDarkMode();
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode(isStorybookInDarkMode ? "dark" : "light");
  }, [isStorybookInDarkMode]);

  return null;
};

const MuiThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <ColorSchemeSwitcher />

      {children}
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <MuiThemeProvider>
        <Story />
      </MuiThemeProvider>
    ),
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

import { ThemeProvider, useColorScheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
import { theme } from "../libs/mui";

interface ColorSchemeSwitcherProps {
  forcedColorScheme: "dark" | "light" | "system";
}

// WORKAROUND: very hacky workaround to support changing color scheme from Storybook
const ColorSchemeSwitcher = ({
  forcedColorScheme,
}: ColorSchemeSwitcherProps) => {
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    if (forcedColorScheme && mode && forcedColorScheme !== mode) {
      setMode(forcedColorScheme);
    }
  }, [mode, forcedColorScheme]);

  return null;
};

const preview: Preview = {
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        Light: "light" as any,
        Dark: "dark" as any,
        System: "system" as any,
      },
      defaultTheme: "System",
      Provider: (p) => {
        const { theme: forcedColorScheme, children, ...rest } = p;

        return (
          <ThemeProvider {...rest} theme={theme}>
            <ColorSchemeSwitcher forcedColorScheme={forcedColorScheme} />
            {children}
          </ThemeProvider>
        );
      },
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

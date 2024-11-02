import { PaletteColorName, theme } from "@/libs/mui";
import { CssBaseline, ThemeProvider, useColorScheme } from "@mui/material";
import createSimplePaletteValueFilter from "@mui/material/utils/createSimplePaletteValueFilter";
import { ArgTypes, ReactRenderer } from "@storybook/react";
import { DecoratorFunction } from "@storybook/types";
import { PropsWithChildren, useEffect } from "react";
import { useDarkMode } from "storybook-dark-mode";

// WORKAROUND: `storybook-dark-mode` pinned at version `4.0.1` because of a bug:
// https://github.com/hipstersmoothie/storybook-dark-mode/issues/282

export const MuiThemeColorArgTypes: Partial<
  ArgTypes<{ color: PaletteColorName }>
> = {
  color: {
    control: "select",
    options: Object.entries(theme.palette)
      .filter(createSimplePaletteValueFilter())
      .map(([color]) => color),
  },
};

const ColorSchemeSwitcher = () => {
  const isStorybookInDarkMode = useDarkMode();
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode(isStorybookInDarkMode ? "dark" : "light");
  }, [isStorybookInDarkMode, setMode]);

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

export const withMuiThemeProvider = (): DecoratorFunction<
  ReactRenderer,
  {}
> => {
  return function MuiThemeProviderDecorator(Story) {
    return (
      <MuiThemeProvider>
        <Story />
      </MuiThemeProvider>
    );
  };
};

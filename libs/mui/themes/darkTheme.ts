import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { baseThemeTokens } from "./baseTheme";

const darkThemeTokens: Parameters<typeof createTheme>[0] = {
  colorSchemes: {
    dark: true,
  },
};

export const darkTheme = createTheme(
  deepmerge(baseThemeTokens, darkThemeTokens)
);

import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { baseThemeTokens } from "./baseTheme";

const lightThemeTokens: Parameters<typeof createTheme>[0] = {
  colorSchemes: {
    light: true,
  },
};

export const lightTheme = createTheme(
  deepmerge(baseThemeTokens, lightThemeTokens)
);

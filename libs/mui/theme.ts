import { createTheme } from "@mui/material/styles";

export const themeTokens: Parameters<typeof createTheme>[0] = {
  colorSchemes: {
    light: true,
    dark: true,
  },
  cssVariables: {
    colorSchemeSelector: ".mui-%s",
  },
};

export const theme = createTheme(themeTokens);

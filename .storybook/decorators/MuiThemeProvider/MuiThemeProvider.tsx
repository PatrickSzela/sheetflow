import { theme } from "@/libs/mui";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { PropsWithChildren } from "react";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";

export const MuiThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <ColorSchemeSwitcher />

      {children}
    </ThemeProvider>
  );
};

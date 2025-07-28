import { type PropsWithChildren } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "@/libs/mui";

export const MuiThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />

      {children}
    </ThemeProvider>
  );
};

import { theme } from "@/libs/mui";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { PropsWithChildren } from "react";

export const MuiThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />

      {children}
    </ThemeProvider>
  );
};

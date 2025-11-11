import { type PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { theme } from "@/libs/mui";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />

      {children}
    </MuiThemeProvider>
  );
};

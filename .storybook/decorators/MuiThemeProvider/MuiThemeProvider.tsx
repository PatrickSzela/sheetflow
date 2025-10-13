import { type PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/libs/mui";

export const MuiThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />

      {children}
    </ThemeProvider>
  );
};

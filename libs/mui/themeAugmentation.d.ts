import type {} from "@mui/material/themeCssVarsAugmentation";

declare module "@mui/material/Paper" {
  interface PaperOwnProps {
    color?: PaletteColors;
  }
}

export {};

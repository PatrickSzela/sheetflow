import { Shadows } from "@mui/material";
import type {} from "@mui/material/themeCssVarsAugmentation";
import { PaletteColorName } from "./utils";

declare module "@mui/material/Paper" {
  interface PaperOwnProps {
    color?: PaletteColorName;
  }
}

declare module "@mui/material/styles" {
  interface PaletteColor {
    shadows: Shadows;
  }

  interface SimplePaletteColorOptions {
    shadows: Shadows;
  }
}

export {};

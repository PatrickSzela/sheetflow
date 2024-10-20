import { Shadows } from "@mui/material";
import type {} from "@mui/material/themeCssVarsAugmentation";
import { PaletteColors } from "./utils";

declare module "@mui/material/Paper" {
  interface PaperOwnProps {
    color?: PaletteColors;
  }
}

declare module "@mui/material/styles" {
  interface PaletteColor {
    colorizedShadows: Shadows;
  }

  interface SimplePaletteColorOptions {
    colorizedShadows: Shadows;
  }
}

export {};

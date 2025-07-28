import { Shadows } from "@mui/material";
import { type } from "@mui/material/themeCssVarsAugmentation";
import { PaletteColorName, PaletteOverlays } from "./utils";

declare module "@mui/material/styles" {
  // custom palettes
  interface Palette {}
  interface PaletteOptions {}

  // custom properties per palette
  interface PaletteColor {
    shadows: Shadows;
    overlays: PaletteOverlays;
  }

  interface SimplePaletteColorOptions {
    shadows?: Shadows;
    overlays?: PaletteOverlays;
  }
}

declare module "@mui/material/Paper" {
  interface PaperOwnProps {
    color?: PaletteColorName;
  }
}

export {};

import {
  type Interpolation,
  type Palette,
  type PaletteColor,
  type PaletteColorOptions,
  type Shadows,
  type SupportedColorScheme,
  type Theme,
} from "@mui/material";
import type { ConditionalPick, Simplify, UnionToTuple } from "type-fest";
import { colorizeBoxShadow, generateColorOverlay } from "./css";

export type PaletteColorName = Simplify<
  keyof ConditionalPick<Palette, PaletteColor>
>;
export type PaletteColorNames = Simplify<UnionToTuple<PaletteColorName>>;

export type PaletteOverlays = {
  active: string;
  focus: string;
  hover: string;
  selected: string;
};

export const simplePaletteValueFilter =
  () =>
  ([, value]: [unknown, PaletteColorOptions]) =>
    typeof value === "object" &&
    "main" in value &&
    typeof value.main === "string";

export const extractPaletteColorNames = (theme: Theme): PaletteColorNames => {
  return Object.entries(theme.palette)
    .filter(simplePaletteValueFilter())
    .map(([color]) => color) as UnionToTuple<PaletteColorName>;
};

export const generatePaletteVariants = <TProps>(
  theme: Theme,
  mapper: (color: PaletteColorName) => {
    props: Partial<TProps>;
    style: Interpolation<{ theme: Theme }>;
  }[],
) => {
  return Object.entries(theme.palette)
    .filter(simplePaletteValueFilter())
    .map(([color]) => mapper(color as PaletteColorName))
    .flat();
};

export const injectShadowsToColorSchemes = (theme: Theme): Theme => {
  const colorNames = extractPaletteColorNames(theme);
  const colorSchemes = theme.colorSchemes;

  for (const scheme of Object.keys(colorSchemes) as SupportedColorScheme[]) {
    for (const color of colorNames) {
      const palette = colorSchemes[scheme]!.palette[color];
      palette.shadows = theme.shadows.map((shadow) =>
        colorizeBoxShadow(shadow, palette.main),
      ) as Shadows;
    }
  }

  return theme;
};

export const injectOverlaysToColorSchemes = (theme: Theme): Theme => {
  const colorNames = extractPaletteColorNames(theme);
  const colorSchemes = theme.colorSchemes;

  for (const scheme of Object.keys(colorSchemes) as SupportedColorScheme[]) {
    for (const color of colorNames) {
      const palette = colorSchemes[scheme]!.palette;
      const action = palette.action;
      const actualColor = palette[color].main;

      palette[color].overlays = {
        active: generateColorOverlay(actualColor, action.activatedOpacity),
        focus: generateColorOverlay(actualColor, action.focusOpacity),
        hover: generateColorOverlay(actualColor, action.hoverOpacity),
        selected: generateColorOverlay(actualColor, action.selectedOpacity),
      };
    }
  }

  return theme;
};

export const enhanceTheme = (theme: Theme): Theme => {
  return injectOverlaysToColorSchemes(injectShadowsToColorSchemes(theme));
};

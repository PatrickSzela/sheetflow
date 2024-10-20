import {
  ColorObject,
  decomposeColor,
  Interpolation,
  Palette,
  PaletteColor,
  Shadows,
  SupportedColorScheme,
  Theme,
} from "@mui/material";
import createSimplePaletteValueFilter from "@mui/material/utils/createSimplePaletteValueFilter";
import { ConditionalPick, Simplify, UnionToTuple } from "type-fest";

export type PaletteColors = Simplify<
  keyof ConditionalPick<Palette, PaletteColor>
>;
export type PaletteColorNames = Simplify<UnionToTuple<PaletteColors>>;

export const changeBoxShadowColor = (
  boxShadow: string,
  colorCallback: (decomposedColor: ColorObject) => string
): string => {
  let shadows = boxShadow.split(/,(?![^\(]*\))/g);

  shadows = shadows.map((shadow) => {
    const items = shadow.split(/ (?![^(]*\))/g);

    return items
      .map((item) => {
        if (item.startsWith("rgb") || item.startsWith("#")) {
          return colorCallback(decomposeColor(item));
        }
        return item; // unknown color
      })
      .join(" ");
  });

  return shadows.join(", ");
};

export const colorizeBoxShadow = (boxShadow: string, color: string): string => {
  return changeBoxShadowColor(boxShadow, ({ values }) => {
    const alpha = (values[3] ?? 1) * 100;
    return `color-mix(in srgb, ${color} ${alpha}%, transparent)`;
  });
};

export const colorizeBoxShadowWithCssVar = (
  boxShadow: string,
  color: string,
  fallback?: string
): string => {
  return colorizeBoxShadow(
    boxShadow,
    fallback ? `var(${color}, ${fallback})` : `var(${color})`
  );
};

export const generatePaletteVariants = <TProps>(
  theme: Theme,
  mapper: (color: PaletteColors) => {
    props: Partial<TProps>;
    style: Interpolation<{ theme: Theme }>;
  }[]
) => {
  return Object.entries(theme.palette)
    .filter(createSimplePaletteValueFilter())
    .map(([color]) => mapper(color as PaletteColors))
    .flat();
};

export const extractPaletteColorNames = (theme: Theme): PaletteColorNames => {
  return Object.entries(theme.palette)
    .filter(createSimplePaletteValueFilter())
    .map(([color]) => color) as UnionToTuple<PaletteColors>;
};

export const injectColorizedShadowsToColorScheme = (
  theme: Theme
): Theme["colorSchemes"] => {
  const colorNames = extractPaletteColorNames(theme);
  const colorSchemes = theme.colorSchemes;

  for (const scheme of Object.keys(colorSchemes) as SupportedColorScheme[]) {
    for (const color of colorNames) {
      const palette = colorSchemes[scheme]!.palette[color];
      palette.colorizedShadows = theme.shadows.map((shadow) =>
        colorizeBoxShadow(shadow, palette.main)
      ) as Shadows;
    }
  }

  return colorSchemes;
};

import {
  decomposeColor,
  Interpolation,
  Palette,
  PaletteColor,
  Theme,
} from "@mui/material";
import createSimplePaletteValueFilter from "@mui/material/utils/createSimplePaletteValueFilter";
import { ConditionalPick, Simplify } from "type-fest";

export type PaletteColors = Simplify<
  keyof ConditionalPick<Palette, PaletteColor>
>;

export const colorizeBoxShadow = (boxShadow: string, color: string): string => {
  let shadows = boxShadow.split(/,(?![^\(]*\))/g);

  shadows = shadows.map((shadow) => {
    const items = shadow.split(/ (?![^(]*\))/g);
    let alpha = 1;

    return items
      .map((item) => {
        if (item.startsWith("rgb") || item.startsWith("#")) {
          const { values } = decomposeColor(item);
          alpha = (values[3] ?? 1) * 100;
          return `color-mix(in srgb, ${color} ${alpha}%, transparent)`;
        }
        return item;
      })
      .join(" ");
  });

  return shadows.join(", ");
};

export const colorizeBoxShadowWithCssVar = (
  boxShadow: string,
  color: string,
  fallback?: string
): string =>
  colorizeBoxShadow(
    boxShadow,
    fallback ? `var(${color}, ${fallback})` : `var(${color})`
  );

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

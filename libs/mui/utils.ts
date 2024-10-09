import { decomposeColor, Palette, PaletteColor } from "@mui/material";
import { ConditionalPick } from "type-fest";

export type PaletteColors = keyof ConditionalPick<Palette, PaletteColor>;

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

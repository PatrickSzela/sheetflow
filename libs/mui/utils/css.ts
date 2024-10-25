import { ColorObject, decomposeColor } from "@mui/material";

export const changeColorOpacity = (color: string, opacity: number) => {
  return `rgb(from ${color} r g b / ${opacity})`;
};

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
    const alpha = values[3] ?? 1;
    return changeColorOpacity(color, alpha);
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

export const generateColorOverlay = (color: string, opacity: number) => {
  const overlay = changeColorOpacity(color, opacity);
  return `linear-gradient(${overlay}, ${overlay})`;
};

import { PaletteColorName, simplePaletteValueFilter, theme } from "@/libs/mui";
import { ArgTypes } from "@storybook/react";

export const MuiThemeColorArgTypes: Partial<
  ArgTypes<{ color: PaletteColorName }>
> = {
  color: {
    control: "select",
    options: Object.entries(theme.palette)
      .filter(simplePaletteValueFilter())
      .map(([color]) => color),
  },
};

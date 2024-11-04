import { PaletteColorName, theme } from "@/libs/mui";
import createSimplePaletteValueFilter from "@mui/material/utils/createSimplePaletteValueFilter";
import { ArgTypes } from "@storybook/react";

export const MuiThemeColorArgTypes: Partial<
  ArgTypes<{ color: PaletteColorName }>
> = {
  color: {
    control: "select",
    options: Object.entries(theme.palette)
      .filter(createSimplePaletteValueFilter())
      .map(([color]) => color),
  },
};

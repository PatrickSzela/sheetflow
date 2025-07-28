import { type ArgTypes } from "@storybook/react-vite";
import {
  simplePaletteValueFilter,
  theme,
  type PaletteColorName,
} from "@/libs/mui";

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

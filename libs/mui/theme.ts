import { PaperProps } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import type {} from "./themeAugmentation.d.ts";
import { generatePaletteVariants, injectShadowsToColorSchemes } from "./utils";

const base = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
});

const tokens: Parameters<typeof createTheme>[0] = {
  colorSchemes: injectShadowsToColorSchemes(base),
  cssVariables: {
    colorSchemeSelector: ".mui-%s",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          "&.MuiPaper-pill": {
            borderRadius: "calc(var(--implicit-height, 24) / 2)",
          },

          "&.MuiPaper-forceBorder": {
            position: "relative",
          },

          "&.MuiPaper-absolute": {
            position: "absolute",
          },
        },
        elevation: {
          "&.MuiPaper-forceBorder:before": {
            content: '""',
            position: "absolute",
            inset: 0,
            border: `1px solid var(--border-color, transparent)`,
            borderRadius: "inherit",
          },

          // "&.MuiPaper-forceBorder:focus-within:before": {
          //   borderWidth: 2,
          // },
        },
      },

      variants: [
        ...generatePaletteVariants<PaperProps>(base, (color) => [
          {
            props: {
              variant: "elevation",
              color,
            },
            style: {
              "--border-color": `var(--mui-palette-${color}-main)`,
            },
          },
          {
            props: {
              variant: "outlined",
              color,
            },
            style: {
              borderColor: `var(--mui-palette-${color}-main)`,
            },
          },
        ]),
      ],
    },
  },
};

export const theme = createTheme(tokens);

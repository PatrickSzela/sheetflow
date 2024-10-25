import {
  outlinedInputClasses,
  OutlinedInputProps,
  PaperProps,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import type {} from "./themeAugmentation.d.ts";
import { enhanceTheme, generatePaletteVariants } from "./utils";

const base = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
});

const { colorSchemes } = enhanceTheme(base);

const tokens: Parameters<typeof createTheme>[0] = {
  colorSchemes: colorSchemes,
  cssVariables: {
    colorSchemeSelector: ".mui-%s",
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        adornedEnd: ({ theme }) => ({
          paddingRight: theme.spacing(1),
        }),
        notchedOutline: {
          borderWidth: 2,
        },
      },
      variants: [
        ...generatePaletteVariants<OutlinedInputProps>(base, (color) => [
          {
            props: {
              color,
            },
            style: ({ theme }) => {
              const palette = (theme.vars || theme).palette[color];

              return {
                [`& .${outlinedInputClasses.notchedOutline}`]: {
                  borderColor: palette.main,
                },

                "&:hover": {
                  backgroundImage: palette.overlays.hover,

                  [`& .${outlinedInputClasses.notchedOutline}`]: {
                    borderColor: palette.main,
                  },
                },

                [`&.${outlinedInputClasses.focused}`]: {
                  backgroundImage: palette.overlays.focus,

                  [`& .${outlinedInputClasses.notchedOutline}`]: {
                    borderColor: palette.main,
                  },
                },
              };
            },
          },
        ]),
      ],
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          "&.MuiPaper-pill": {
            borderRadius: "calc(var(--implicit-height, 24) / 2)",
            minHeight: "var(--implicit-height)",
          },

          "&.MuiPaper-forceBorder": {
            position: "relative",
          },

          "&.MuiPaper-absolute": {
            position: "absolute",
          },
        },
        elevation: {
          backgroundImage: "none",

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

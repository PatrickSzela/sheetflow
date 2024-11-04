import {
  outlinedInputClasses,
  OutlinedInputProps,
  PaperProps,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import type {} from "./themeAugmentation.d.ts";
import { enhanceTheme, generatePaletteVariants, mixColors } from "./utils";

const base = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
});

const { colorSchemes } = enhanceTheme(base);

const tokens: Parameters<typeof createTheme>[0] = {
  colorSchemes,
  cssVariables: {
    colorSchemeSelector: ".mui-%s",
  },
  components: {
    // TODO: move to a custom component
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create(["background-color"], {
            duration: theme.transitions.duration.shortest,
          }),
        }),
        adornedEnd: ({ theme }) => ({
          // TODO: icons are being remounted, use JS instead
          paddingRight: theme.spacing(1),
        }),
        notchedOutline: ({ theme }) => ({
          borderWidth: 2,

          transition: theme.transitions.create(["border-color"], {
            duration: theme.transitions.duration.shortest,
          }),
        }),
      },
      variants: [
        ...generatePaletteVariants<OutlinedInputProps>(base, (color) => [
          {
            props: {
              color,
            },
            style: ({ theme }) => {
              const palette = (theme.vars || theme).palette[color];
              const action = (theme.vars || theme).palette.action;

              return {
                [`& .${outlinedInputClasses.notchedOutline}`]: {
                  borderColor: palette.main,
                },

                "&:hover": {
                  backgroundColor: mixColors(
                    "transparent",
                    palette.main,
                    action.hoverOpacity
                  ),

                  [`& .${outlinedInputClasses.notchedOutline}`]: {
                    borderColor: palette.main,
                  },
                },

                [`&.${outlinedInputClasses.focused}`]: {
                  backgroundColor: mixColors(
                    "transparent",
                    palette.main,
                    action.focusOpacity
                  ),

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

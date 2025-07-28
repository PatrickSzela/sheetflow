import { AppBar, styled, type AppBarProps } from "@mui/material";
import { generatePaletteVariants } from "@/libs/mui";

export interface ToolbarProps extends Omit<AppBarProps, "enableColorOnDark"> {
  interactive?: boolean;
  shape?: "rectangle" | "pill";
}

const ToolbarRoot = styled((props) => <AppBar enableColorOnDark {...props} />, {
  shouldForwardProp: (prop) => prop !== "interactive" && prop !== "shape",
})<ToolbarProps>(({ theme }) => ({
  position: "static",
  minHeight: 40,
  borderRadius: (theme.vars || theme).shape.borderRadius,
  backgroundColor: (theme.vars || theme).palette.background.paper,

  variants: [
    {
      props: {
        interactive: true,
      },
      style: {
        border: `2px solid transparent`,
      },
    },
    {
      props: {
        shape: "pill",
      },
      style: {
        borderRadius: 999,
      },
    },
    ...generatePaletteVariants<ToolbarProps>(theme, (color) => [
      {
        props: {
          color,
        },
        style: {
          borderColor: (theme.vars || theme).palette[color].main,
          backgroundImage: (theme.vars || theme).palette[color].overlays.hover,
        },
      },
    ]),
  ],
}));

export const Toolbar = (props: ToolbarProps) => {
  return <ToolbarRoot {...props} />;
};

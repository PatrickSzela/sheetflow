import { generateColorOverlay, generatePaletteVariants } from "@/libs/mui";
import { AppBar, AppBarProps, styled } from "@mui/material";

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
          // TODO: move to palette
          backgroundImage: generateColorOverlay(
            (theme.vars || theme).palette[color].main,
            0.08
          ),
        },
      },
    ]),
  ],
}));

export const Toolbar = (props: ToolbarProps) => {
  return <ToolbarRoot {...props} />;
};

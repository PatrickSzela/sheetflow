import {
  Box,
  BoxProps,
  capitalize,
  Drawer,
  DrawerProps,
  Interpolation,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export interface MainProps extends BoxProps {
  slotProps?: {
    drawer?: DrawerProps;
  };
}

const drawerWidth = 240;

const MainRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "slotProps",
})<MainProps>(({ theme }) => {
  const sides = ["left", "right"];

  const variants: Interpolation<MainProps> = sides
    .map((side) => [
      {
        props: ({ slotProps }: MainProps) => slotProps?.drawer?.anchor === side,
        style: {
          [theme.breakpoints.up("sm")]: {
            [`margin${capitalize(side)}`]: `-${drawerWidth}px`,
          },
        },
      },
      {
        props: ({ slotProps }: MainProps) =>
          slotProps?.drawer?.anchor === side && slotProps.drawer.open,
        style: {
          [theme.breakpoints.up("sm")]: {
            [`margin${capitalize(side)}`]: 0,
          },
        },
      },
    ])
    .flat();

  console.log(variants);

  return {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    variants: [
      ...variants,
      {
        props: ({ slotProps }) => slotProps?.drawer?.open ?? false,
        style: {
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      },
    ],
  };
});

export const Main = (props: MainProps) => {
  const { slotProps, children, ...restProps } = props;
  const { drawer = {} } = slotProps ?? {};
  const { anchor } = drawer ?? {};

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  if (drawer.anchor === undefined) drawer.anchor = "left";

  const child = <MainRoot {...props}>{children}</MainRoot>;

  return (
    <Box {...restProps}>
      {anchor === "right" ? child : null}

      <Drawer
        variant={matches ? "persistent" : "temporary"}
        {...drawer}
        sx={{
          ...drawer?.sx,
          width: 240,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      />

      {anchor === "left" ? child : null}
    </Box>
  );
};

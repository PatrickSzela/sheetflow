import Close from "@mui/icons-material/Close";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import {
  Box,
  BoxProps,
  capitalize,
  Drawer,
  DrawerProps,
  IconButton,
  Stack,
  StackProps,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";

export interface MainProps extends StackProps {
  slotProps?: {
    drawer?: DrawerProps;
  };
}

const drawerWidth = 240;

interface MainRootProps extends BoxProps {
  drawerOpen: boolean;
  drawerAnchor: "left" | "right" | "bottom" | "top";
}

const MainRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "drawerOpen" && prop !== "drawerAnchor",
})<MainRootProps>(({ theme }) => {
  const sides = ["left", "right"];

  const variants = sides
    .map((side) => [
      {
        props: {
          drawerAnchor: side,
        },
        style: {
          [theme.breakpoints.up("sm")]: {
            [`margin${capitalize(side)}`]: `-${drawerWidth}px`,
          },
        },
      },
      {
        props: {
          drawerOpen: true,
          drawerAnchor: side,
        },
        style: {
          [theme.breakpoints.up("sm")]: {
            [`margin${capitalize(side)}`]: 0,
          },
        },
      },
    ])
    .flat();

  return {
    flex: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    variants: [
      ...variants,
      {
        props: {
          drawerOpen: true,
        },
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

enum LayoutOptions {
  showDependencies = "showDependencies",
}

export const Main = (props: MainProps) => {
  const { slotProps, children, ...restProps } = props;
  const { drawer = {} } = slotProps ?? {};

  const theme = useTheme();
  const isNotMobile = useMediaQuery(theme.breakpoints.up("sm"));

  const [layoutOptions, setLayoutOptions] = useState<LayoutOptions[]>(
    isNotMobile ? [LayoutOptions.showDependencies] : []
  );

  const closeDependencies = () => {
    setLayoutOptions((prev) =>
      prev.filter((i) => i !== LayoutOptions.showDependencies)
    );
  };

  if (drawer.anchor === undefined) drawer.anchor = "left";
  drawer.open = layoutOptions.includes(LayoutOptions.showDependencies);

  const child = (
    <MainRoot drawerAnchor={drawer.anchor ?? "left"} drawerOpen={drawer.open}>
      {children}
    </MainRoot>
  );

  return (
    <Stack {...restProps}>
      <Toolbar variant="dense">
        <ToggleButtonGroup
          size="small"
          value={layoutOptions}
          onChange={(_, value) => setLayoutOptions(value)}
        >
          <ToggleButton value={LayoutOptions.showDependencies}>
            <FormatListNumberedIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>

      <Stack direction="row" flex={1}>
        {drawer.anchor === "right" ? child : null}

        <Drawer
          variant={isNotMobile ? "persistent" : "temporary"}
          open={drawer.open}
          onClose={closeDependencies}
          {...drawer}
          sx={{
            ...drawer?.sx,
            width: 240,
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar
            variant="dense"
            disableGutters
            sx={{ paddingLeft: 2, paddingRight: 1 }}
          >
            <Stack width="100%" alignItems="center" direction="row">
              <Typography flex={1} variant="h6">
                Dependencies
              </Typography>

              <IconButton onClick={closeDependencies}>
                <Close />
              </IconButton>
            </Stack>
          </Toolbar>

          {drawer.children}
        </Drawer>

        {drawer.anchor === "left" ? child : null}
      </Stack>
    </Stack>
  );
};

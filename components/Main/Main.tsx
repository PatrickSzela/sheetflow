import { useState } from "react";
import Close from "@mui/icons-material/Close";
import DataArrayIcon from "@mui/icons-material/DataArray";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import SixtyFpsIcon from "@mui/icons-material/SixtyFps";
import Box, { type BoxProps } from "@mui/material/Box";
import Drawer, { type DrawerProps } from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack, { type StackProps } from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { capitalize } from "@mui/material/utils";
import {
  SheetFlowEngine,
  useSheetFlow,
  useSheetFlowConfig,
} from "@/libs/sheetflow";

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
    // required for support of DockView's automatic resizing
    overflow: "hidden",
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

enum Settings {
  showDependencies = "showDependencies",
  generateParenthesis = "generateParenthesis",
  generateValues = "generateValues",
}

export const Main = (props: MainProps) => {
  const { slotProps, children, ...restProps } = props;
  const { drawer: _drawer = {} } = slotProps ?? {};
  const drawer = { ..._drawer };

  const sf = useSheetFlow();
  const config = useSheetFlowConfig();
  const theme = useTheme();
  const isNotMobile = useMediaQuery(theme.breakpoints.up("sm"));

  const [settings, setSettings] = useState<Settings[]>([
    ...(isNotMobile ? [Settings.showDependencies] : []),
    ...(config.flow.generateParenthesis ? [Settings.generateParenthesis] : []),
    ...(config.flow.generateValues ? [Settings.generateValues] : []),
  ]);

  const closeDependencies = () => {
    setSettings((prev) => prev.filter((i) => i !== Settings.showDependencies));
  };

  drawer.anchor ??= "left";
  drawer.open = settings.includes(Settings.showDependencies);

  const child = (
    <MainRoot drawerAnchor={drawer.anchor ?? "left"} drawerOpen={drawer.open}>
      {children}
    </MainRoot>
  );

  return (
    <Stack {...restProps}>
      <Toolbar variant="dense">
        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            size="small"
            value={settings}
            onChange={(_, value: Settings[]) => {
              const generateParenthesis = value.includes(
                Settings.generateParenthesis,
              );
              const generateValues = value.includes(Settings.generateValues);

              sf.updateConfig({
                flow: { generateParenthesis, generateValues },
              });
              setSettings(value);
            }}
          >
            <ToggleButton
              title="Toggle Dependencies sidebar"
              value={Settings.showDependencies}
            >
              <FormatListNumberedIcon />
            </ToggleButton>

            <ToggleButton
              title="Generate Value nodes"
              value={Settings.generateValues}
            >
              <SixtyFpsIcon />
            </ToggleButton>

            <ToggleButton
              title="Generate Parenthesis nodes"
              value={Settings.generateParenthesis}
            >
              <DataArrayIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControl>
            <Select
              value={config.language}
              size="small"
              title="Engine language"
              onChange={(e) => {
                sf.setLanguage(e.target.value);
              }}
            >
              {Object.entries(
                (
                  sf.constructor as typeof SheetFlowEngine
                ).getAllPrettyLanguages(),
              ).map(([code, lang]) => (
                <MenuItem key={code} value={code}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
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

import { useColorScheme } from "@mui/material";
import { useEffect } from "react";
import { useDarkMode } from "storybook-dark-mode";

// WORKAROUND: `storybook-dark-mode` pinned at version `4.0.1` because of a bug:
// https://github.com/hipstersmoothie/storybook-dark-mode/issues/282

export const ColorSchemeSwitcher = () => {
  const isStorybookInDarkMode = useDarkMode();
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode(isStorybookInDarkMode ? "dark" : "light");
  }, [isStorybookInDarkMode, setMode]);

  return null;
};

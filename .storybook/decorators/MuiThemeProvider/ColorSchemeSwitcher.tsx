import { useColorScheme } from "@mui/material";
import { ReactRenderer } from "@storybook/react-vite";
import { useEffect } from "react";
import { StoryContext } from "storybook/internal/types";

export type Theme = "system" | "light" | "dark";

const isTheme = (theme: string): theme is Theme => {
  return ["system", "light", "dark"].includes(theme);
};

export const ColorSchemeSwitcher = ({
  context,
}: {
  context: StoryContext<ReactRenderer>;
}) => {
  const { mode, setMode } = useColorScheme();

  const cTheme = (context.globals["theme"] as string) || "system";

  useEffect(() => {
    if (isTheme(cTheme) && mode !== cTheme) {
      setMode(cTheme);
    }
  }, [cTheme, mode, setMode]);

  return null;
};

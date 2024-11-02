import { useColorScheme } from "@mui/material";
import { ObjectInspector, chromeDark, chromeLight } from "react-inspector";

export interface ObjectInspectorWrapperProps {
  data: any;
}

export const ObjectInspectorWrapper = (props: ObjectInspectorWrapperProps) => {
  const { data } = props;

  const { mode, systemMode } = useColorScheme();

  const isDarkMode =
    (mode === "system" && systemMode === "dark") || mode === "dark";

  const theme: typeof chromeDark = {
    ...(isDarkMode ? chromeDark : chromeLight),
    BASE_BACKGROUND_COLOR: "transparent",
  };

  return (
    <ObjectInspector
      expandLevel={10}
      data={data}
      theme={theme as any} // workaround for broken types
    />
  );
};

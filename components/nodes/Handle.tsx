import { styled } from "@mui/material";
import { Handle, HandleProps } from "@xyflow/react";

const HandleRoot = styled(Handle)(() => ({
  backgroundColor: "var(--node-color-contrast-text)",
  borderColor: "var(--node-color)",
}));

export const MuiHandle = (props: HandleProps) => {
  return <HandleRoot {...props} />;
};

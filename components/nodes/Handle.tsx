import { styled } from "@mui/material";
import { Handle as RFHandle, HandleProps } from "@xyflow/react";

const HandleRoot = styled(RFHandle)(() => ({
  backgroundColor: "var(--node-color-contrast-text)",
  borderColor: "var(--node-color)",
  borderWidth: "var(--node-border-width)",

  width: 8,
  height: 8,

  "&.react-flow__handle-left": {
    left: "calc(var(--node-border-width) / -2)",
  },

  "&.react-flow__handle-right": {
    right: "calc(var(--node-border-width) / -2)",
  },
}));

export const Handle = (props: HandleProps) => {
  return <HandleRoot {...props} />;
};

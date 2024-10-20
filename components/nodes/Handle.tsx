import { styled } from "@mui/material";
import { HandleProps, Handle as RFHandle } from "@xyflow/react";

const HandleRoot = styled(RFHandle)(() => ({
  backgroundColor: "var(--Node-handleColor)",
  borderColor: "var(--Node-color)",
  borderWidth: "var(--Node-borderWidth, 2px)",
  width: 8,
  height: 8,

  "&.react-flow__handle-left": {
    left: "calc(var(--Node-borderWidth, 0px) / -2)",
  },

  "&.react-flow__handle-right": {
    right: "calc(var(--Node-borderWidth, 0px) / -2)",
  },
}));

export const Handle = (props: HandleProps) => {
  return <HandleRoot {...props} />;
};

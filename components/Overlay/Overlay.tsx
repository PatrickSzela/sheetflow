import { Stack, StackProps, styled } from "@mui/material";

const OverlayRoot = styled(Stack)(({ theme }) => ({
  position: "relative",
  height: "100%",
  width: "100%",
  padding: theme.spacing(2),
  pointerEvents: "none",

  // reset pointerEvents for children
  "& > *": {
    pointerEvents: "auto",
  },
}));

export const Overlay = (props: StackProps) => {
  return <OverlayRoot direction="column" {...props} />;
};

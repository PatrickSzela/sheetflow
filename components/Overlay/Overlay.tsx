import { Box, styled, type BoxProps } from "@mui/material";

const OverlayRoot = styled(Box)(({ theme }) => ({
  position: "relative",
  height: "100%",
  width: "100%",
  padding: theme.spacing(2),
  pointerEvents: "none",
  display: "grid",
  gap: theme.spacing(2),
  gridTemplateAreas: `
    'top      top       top'
    'left     center    right'
    'bottom   bottom    bottom'
  `,
  gridTemplateColumns: "auto 1fr auto",
  gridTemplateRows: "auto 1fr auto",

  // reset pointerEvents for children
  "& > *": {
    pointerEvents: "auto",
  },
}));

export const Overlay = (props: BoxProps) => {
  return <OverlayRoot {...props} />;
};

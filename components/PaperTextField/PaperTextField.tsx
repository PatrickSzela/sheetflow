import {
  FilledTextFieldProps,
  outlinedInputClasses,
  Paper,
  PaperProps,
  styled,
  TextField,
} from "@mui/material";
import clsx from "clsx";
import paperTextFieldClasses from "./paperTextFieldClasses";

export interface PaperTextFieldProps
  extends Omit<FilledTextFieldProps, "variant" | "slotProps"> {
  slotProps?: FilledTextFieldProps["slotProps"] & {
    paper?: PaperProps;
  };
  pill?: boolean;
}

const PaperTextFieldRoot = styled(Paper)(({ theme }) => ({
  [`&.${paperTextFieldClasses.pill}`]: {
    "--mui-shape-borderRadius": "99px",
    borderRadius: "var(--mui-shape-borderRadius)",
  },
}));

const PaperTextFieldTextField = styled(TextField)(({ theme }) => ({
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderColor: "transparent",
  },

  [`& .${outlinedInputClasses.sizeSmall}.${outlinedInputClasses.adornedEnd}`]: {
    paddingRight: 8,
  },
}));

export const PaperTextField = (props: PaperTextFieldProps) => {
  const { slotProps, sx, pill, ...otherProps } = props;
  const { paper: paperProps, ...otherSlotProps } = slotProps ?? {};

  return (
    <PaperTextFieldRoot
      {...paperProps}
      className={clsx({
        [paperTextFieldClasses.root]: true,
        [paperTextFieldClasses.pill]: pill,
      })}
      sx={sx}
    >
      <PaperTextFieldTextField
        {...otherProps}
        fullWidth
        slotProps={otherSlotProps}
        variant="outlined"
      />
    </PaperTextFieldRoot>
  );
};

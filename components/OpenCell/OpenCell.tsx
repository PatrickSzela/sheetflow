import CloseIcon from "@mui/icons-material/Close";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useSheetFlow, type PlacedAstSource } from "@/libs/sheetflow";

// TODO: add cell content preview
// TODO: add support for named expressions

export type OpenCellProps = Omit<DialogProps, "onSubmit"> & {
  onSubmit: (reference: PlacedAstSource) => void;
  closeable?: boolean;
};

export const OpenCell = (props: OpenCellProps) => {
  const { closeable, onSubmit, onClose, ...rest } = props;

  const sf = useSheetFlow();

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    const sheet = formJson["sheet"];
    const position = formJson["position"];

    const alertInvalid = () =>
      alert(
        "Invalid address! Make sure your Sheet name doesn't include special characters and Position uses A1 reference style",
      );

    if (typeof sheet !== "string" || typeof position !== "string") {
      alertInvalid();
      return;
    }

    if (!sf.doesSheetExists(sheet)) {
      try {
        sf.addSheet(sheet);
      } catch (e) {
        alertInvalid();
        return;
      }
    }

    // TODO: handle invalid address in a better way
    try {
      const address = sf.stringToCellAddress(`${sheet}!${position}`);
      onSubmit(address);
    } catch (e) {
      alertInvalid();
    }
  };

  return (
    <Dialog {...rest} onClose={onClose}>
      {closeable && (
        <IconButton
          sx={{ position: "absolute", top: 12, right: 12 }}
          onClick={() => onClose?.({}, "escapeKeyDown")}
        >
          <CloseIcon />
        </IconButton>
      )}

      <DialogTitle>Open Cell</DialogTitle>

      <DialogContent sx={{ overflow: "visible" }}>
        <Stack
          id="open-cell-dialog"
          component="form"
          gap={2}
          onSubmit={onFormSubmit}
        >
          <Autocomplete
            freeSolo
            options={sf.getAllSheetNames()}
            renderInput={(params) => (
              <TextField
                {...params}
                name="sheet"
                label="Sheet name"
                helperText={
                  <>
                    <InfoOutlineIcon
                      sx={{ fontSize: 15, verticalAlign: "text-bottom" }}
                    />{" "}
                    Sheet not on the list will be created automatically
                  </>
                }
              />
            )}
          />
          <TextField name="position" label="Cell position" />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button type="submit" form="open-cell-dialog">
          Open
        </Button>
      </DialogActions>
    </Dialog>
  );
};

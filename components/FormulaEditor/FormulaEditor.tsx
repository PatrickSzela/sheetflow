import { useCallback, useEffect } from "react";
// eslint-disable-next-line no-restricted-imports
import type { SvgIconComponent } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PendingIcon from "@mui/icons-material/Pending";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { AstFlow, type AstFlowProps } from "@/components/AstFlow";
import { Overlay } from "@/components/Overlay";
import { type PaletteColorName } from "@/libs/mui";
import {
  useCreatePlacedAst,
  usePlacedAstData,
  useSheetFlow,
  useUpdateFormulaDebounced,
  type MissingReferences,
} from "@/libs/sheetflow";

type State = "success" | "warning" | "error" | "loading";

export interface FormulaEditorProps {
  defaultScope: number;
  defaultFormula?: string;
  flowProps?: Omit<AstFlowProps, "placedAst">;
  onFocus?: (uuid: string) => void;
}

const getEditorData = (
  loading: boolean,
  error: string | undefined,
  missing: MissingReferences,
  addMissing: () => void,
) => {
  let state: State = "success";
  let color: PaletteColorName;
  let title: string | undefined;
  let description: string | undefined;
  let action: React.ReactNode;
  let Icon: SvgIconComponent;

  if (error) {
    state = "error";
  } else if (loading) {
    state = "loading";
  } else if (missing.namedExpressions.length || missing.sheets.length) {
    state = "warning";
  }

  switch (state) {
    case "success": {
      Icon = CheckCircleIcon;
      title = "Formula is valid";
      color = "success";
      break;
    }
    case "warning": {
      Icon = ErrorIcon;
      title = "Missing references";
      description =
        "Your formula refers to sheets or named expressions that are currently missing. Would you like to add them?";
      action = (
        <Button color="inherit" size="small" onClick={addMissing}>
          Add
        </Button>
      );
      color = "warning";
      break;
    }
    case "error": {
      Icon = ErrorIcon;
      title = "Error";
      description = error;
      color = "error";
      break;
    }
    case "loading": {
      Icon = PendingIcon;
      color = "info";
      break;
    }
  }

  return { state, color, title, description, action, Icon };
};

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps, defaultScope, onFocus } = props;

  const sf = useSheetFlow();

  const { placedAst } = useCreatePlacedAst(defaultFormula, defaultScope);
  const { missing } = usePlacedAstData(placedAst);

  const { formula, updateFormula, error, loading } =
    useUpdateFormulaDebounced(placedAst);

  const addMissing = useCallback(() => {
    const { namedExpressions, sheets } = missing;

    sf.pauseEvaluation();

    for (const sheet of sheets) {
      sf.addSheet(sheet);
    }

    for (const namedExpression of namedExpressions) {
      sf.addNamedExpression(namedExpression);
    }

    sf.resumeEvaluation();
  }, [missing, sf]);

  const { Icon, action, color, description, title } = getEditorData(
    loading,
    error,
    missing,
    addMissing,
  );

  // WORKAROUND: this is a temporary solution until AST reconciliation & layout manager are implemented
  useEffect(() => {
    onFocus?.(placedAst.uuid);
  }, [onFocus, placedAst]);

  return (
    <Box position="relative" width="100%" height="100%">
      <Box position="absolute" sx={{ inset: 0 }}>
        <AstFlow placedAst={placedAst} {...flowProps} />
      </Box>

      <Overlay>
        <Paper elevation={4} sx={{ gridArea: "top", borderRadius: 40 }}>
          <OutlinedInput
            className="FormulaInput"
            value={formula}
            onChange={(e) => {
              updateFormula(e.target.value);
            }}
            size="small"
            placeholder="Enter your Formula here..."
            color={color}
            fullWidth
            sx={{ borderRadius: "inherit" }}
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title={title}>
                  <Icon color={color} {...(error && { titleAccess: error })} />
                </Tooltip>
              </InputAdornment>
            }
          />
        </Paper>

        {title && description ? (
          <Alert
            severity={color}
            icon={false}
            sx={{
              gridArea: "right",
              alignSelf: "start",
              flexDirection: "column",
              width: 300,
            }}
            action={action}
          >
            <AlertTitle>{title}</AlertTitle>

            <Typography variant="inherit">{description}</Typography>
          </Alert>
        ) : null}
      </Overlay>
    </Box>
  );
};

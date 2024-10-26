import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import { Overlay } from "@/components/Overlay";
import { useFormulaAst, useSheetFlow } from "@/libs/sheetflow";
import { CheckCircle, Error, SvgIconComponent } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

type State = "success" | "warning" | "error";

export interface FormulaEditorProps {
  scope: string;
  defaultFormula?: string;
  flowProps?: Omit<FormulaFlowProps, "flatAst" | "uuid">;
  onFocus?: (uuid: string) => void;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps, scope, onFocus } = props;

  const sf = useSheetFlow();

  const [formula, setFormula] = useState<string>(defaultFormula ?? "");
  const { flatAst, missing, error, uuid } = useFormulaAst(formula, scope);

  const addMissing = useCallback(() => {
    sf.pauseEvaluation();

    for (const sheet of missing.sheets ?? []) {
      sf.addSheet(sheet);
    }

    for (const namedExpression of missing.namedExpressions ?? []) {
      sf.addNamedExpression(namedExpression);
    }

    sf.resumeEvaluation();
  }, [missing.namedExpressions, missing.sheets, sf]);

  let state: State = "success";
  let title: string | undefined;
  let description: string | undefined;
  let action: React.ReactNode;
  let Icon: SvgIconComponent;

  if (error) {
    state = "error";
  } else if (missing.namedExpressions.length || missing.sheets.length) {
    state = "warning";
  }

  switch (state) {
    case "success":
      Icon = CheckCircle;
      title = "Formula is valid";
      break;

    case "warning":
      Icon = Error;
      title = "Missing references";
      description =
        "Your formula refers to sheets or named expressions that are currently missing. Would you like to add them?";
      action = (
        <Button color="inherit" size="small" onClick={addMissing}>
          Add
        </Button>
      );
      break;

    case "error":
      Icon = Error;
      title = "Error";
      description = error;
      break;
  }

  // WORKAROUND: this is a temporary solution until AST reconciliation & layout manager are implemented
  useEffect(() => {
    uuid && onFocus?.(uuid);
  }, [onFocus, uuid]);

  return (
    <Box position="relative" width="100%" height="100%">
      <Box position="absolute" sx={{ inset: 0 }}>
        <FormulaFlow uuid={uuid} flatAst={flatAst} {...flowProps} />
      </Box>

      <Overlay>
        <Paper elevation={4} sx={{ gridArea: "top", borderRadius: 40 }}>
          <OutlinedInput
            defaultValue={defaultFormula}
            onChange={(e) => {
              setFormula(e.target.value);
            }}
            size="small"
            placeholder="Enter your Formula here..."
            color={state}
            fullWidth
            sx={{ borderRadius: "inherit" }}
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title={title}>
                  <Icon color={state} titleAccess={error} />
                </Tooltip>
              </InputAdornment>
            }
          />
        </Paper>

        {title && description ? (
          <Alert
            severity={state}
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

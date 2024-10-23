import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import { Overlay } from "@/components/Overlay";
import { Toolbar } from "@/components/Toolbar";
import { useFormulaAst, useSheetFlow } from "@/libs/sheetflow";
import { Check, Error, SvgIconComponent, Warning } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  InputAdornment,
  InputBase,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

type State = "success" | "warning" | "error";

export interface FormulaEditorProps {
  scope: string;
  defaultFormula?: string;
  flowProps?: Omit<FormulaFlowProps, "ast" | "flatAst" | "values">;
  onFocus?: (uuid: string) => void;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps, scope, onFocus } = props;

  const sf = useSheetFlow();

  const [formula, setFormula] = useState<string>(defaultFormula ?? "");
  const { flatAst, values, error, uuid } = useFormulaAst(formula, scope);

  const missing = useMemo(
    () => sf.getMissingSheetsAndNamedExpressions(flatAst ?? []),
    [flatAst, sf]
  );

  const addMissing = useCallback(() => {
    sf.pauseEvaluation();

    for (const sheet of missing.sheets ?? []) {
      sf.addSheet(sheet);
    }

    for (const namedExpression of missing.namedExpressions ?? []) {
      sf.setNamedExpression(namedExpression, "");
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
      Icon = Check;
      title = "Formula is valid";
      break;

    case "warning":
      Icon = Warning;
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
        <FormulaFlow flatAst={flatAst} values={values} {...flowProps} />
      </Box>

      <Overlay>
        <Toolbar
          shape="pill"
          interactive
          color={state}
          sx={{ gridArea: "top" }}
        >
          <InputBase
            defaultValue={defaultFormula}
            onChange={(e) => {
              setFormula(e.target.value);
            }}
            placeholder="Enter your Formula here..."
            error={!!error}
            sx={{ flex: 1, paddingRight: 1, paddingLeft: 2 }}
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title={title}>
                  <Icon color={state} titleAccess={error} />
                </Tooltip>
              </InputAdornment>
            }
          />
        </Toolbar>

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

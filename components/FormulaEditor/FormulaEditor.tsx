import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import { Overlay } from "@/components/Overlay";
import { useFormulaAst, useSheetFlow } from "@/libs/sheetflow";
import { ErrorOutline } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  InputAdornment,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  // WORKAROUND: this is a temporary solution until AST reconciliation & layout manager are implemented
  useEffect(() => {
    uuid && onFocus?.(uuid);
  }, [onFocus, uuid]);

  return (
    <Box position="relative" flex="1" width="100%" height="100%">
      <Box position="absolute" sx={{ inset: 0 }}>
        <FormulaFlow flatAst={flatAst} values={values} {...flowProps} />
      </Box>

      <Overlay>
        <Paper
          component={Stack}
          className="MuiPaper-pill MuiPaper-forceBorder"
          sx={{
            "--implicit-height": "40px",
          }}
          spacing={1}
          direction="row"
          color={error ? "error" : undefined}
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
              error && (
                <InputAdornment position="end">
                  <ErrorOutline color="error" titleAccess={error} />
                </InputAdornment>
              )
            }
          />
        </Paper>

        {missing.sheets?.length || missing.namedExpressions?.length ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={addMissing}>
                Add
              </Button>
            }
          >
            <AlertTitle>Missing sheets and/or named expressions</AlertTitle>

            <Typography variant="inherit">
              Your formula refers to sheets or named expressions that are
              currently missing. Would you like to add them?
            </Typography>
          </Alert>
        ) : null}
      </Overlay>
    </Box>
  );
};

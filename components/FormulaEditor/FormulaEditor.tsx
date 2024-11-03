import { AstFlow, AstFlowProps } from "@/components/AstFlow";
import { Overlay } from "@/components/Overlay";
import {
  useCreatePlacedAst,
  usePlacedAstData,
  useSheetFlow,
} from "@/libs/sheetflow";
import {
  CheckCircle,
  Error as ErrorIcon,
  SvgIconComponent,
} from "@mui/icons-material";
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
import { useInjectValuesToFlow } from "./useInjectValuesToFlow";

type State = "success" | "warning" | "error";

export interface FormulaEditorProps {
  defaultScope: string;
  defaultFormula?: string;
  flowProps?: Omit<AstFlowProps, "flatAst">;
  onFocus?: (uuid: string) => void;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps, defaultScope, onFocus } = props;

  const sf = useSheetFlow();

  const [error, setError] = useState<string>();
  const { placedAst, updateFormula } = useCreatePlacedAst(
    defaultFormula,
    defaultScope
  );
  const { flatAst, missing } = usePlacedAstData(placedAst);
  const { injectValues } = useInjectValuesToFlow(placedAst);

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
      Icon = ErrorIcon;
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
      Icon = ErrorIcon;
      title = "Error";
      description = error;
      break;
  }

  // WORKAROUND: this is a temporary solution until AST reconciliation & layout manager are implemented
  useEffect(() => {
    onFocus?.(placedAst.uuid);
  }, [onFocus, placedAst]);

  return (
    <Box position="relative" width="100%" height="100%">
      <Box position="absolute" sx={{ inset: 0 }}>
        <AstFlow
          flatAst={flatAst}
          enhanceGeneratedFlow={injectValues}
          {...flowProps}
        />
      </Box>

      <Overlay>
        <Paper elevation={4} sx={{ gridArea: "top", borderRadius: 40 }}>
          <OutlinedInput
            defaultValue={defaultFormula}
            onChange={(e) => {
              try {
                updateFormula(e.target.value, defaultScope);
                setError(undefined);
              } catch (e) {
                if (e instanceof Error) setError(e.message);
                else throw e;
              }
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

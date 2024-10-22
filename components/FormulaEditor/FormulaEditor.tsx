import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import { Main } from "@/components/Main";
import {
  groupReferencesBySheet,
  useFormulaAst,
  useSheetFlow,
} from "@/libs/sheetflow";
import { ErrorOutline } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";

export interface FormulaEditorProps {
  scope: string;
  defaultFormula?: string;
  flowProps?: Omit<FormulaFlowProps, "ast" | "flatAst" | "values">;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps, scope } = props;

  const sf = useSheetFlow();

  // TODO: remove once drawer is reworked
  const theme = useTheme();
  const isNotMobile = useMediaQuery(theme.breakpoints.up("sm"));

  const [drawerOpen, setDrawerOpen] = useState(isNotMobile);

  const [formula, setFormula] = useState<string>(defaultFormula ?? "");
  const {
    flatAst,
    values,
    precedents = [],
    error,
  } = useFormulaAst(formula, scope);

  const { cells, namedExpressions } = useMemo(
    () => groupReferencesBySheet(sf, precedents),
    [sf, precedents]
  );

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

  // TODO: remove memo once injecting values has been replaced with hooks
  const drawerChildren = useMemo(() => {
    return (
      <DependenciesEditor cells={cells} namedExpressions={namedExpressions} />
    );
  }, [cells, namedExpressions]);

  return (
    <Main
      display="flex"
      width="100%"
      height="100%"
      slotProps={{
        drawer: {
          anchor: "right",
          open: drawerOpen,
          children: drawerChildren,
          onClose: () => setDrawerOpen(false),
        },
      }}
    >
      <Box position="relative" flex="1">
        <Box width="100%" height="100%">
          <FormulaFlow flatAst={flatAst} values={values} {...flowProps} />
        </Box>

        <Box position="absolute" padding={0.5} top={16} left={16} right={16}>
          <Paper
            component={Stack}
            className="MuiPaper-pill MuiPaper-forceBorder"
            sx={{
              "--implicit-height": "48px",
            }}
            spacing={1}
            direction="row"
            color={error ? "error" : undefined}
          >
            <IconButton
              onClick={() => setDrawerOpen((prev) => !prev)}
              title="Open/Close dependencies"
            >
              <MenuIcon />
            </IconButton>

            <InputBase
              defaultValue={defaultFormula}
              onChange={(e) => {
                setFormula(e.target.value);
              }}
              placeholder="Enter your Formula here..."
              error={!!error}
              sx={{ flex: 1, paddingRight: 1 }}
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
        </Box>
      </Box>
    </Main>
  );
};

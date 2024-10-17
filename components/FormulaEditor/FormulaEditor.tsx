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
  Box,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Stack,
} from "@mui/material";
import { useMemo, useState } from "react";

export interface FormulaEditorProps {
  scope: string;
  defaultFormula?: string;
  flowProps?: Omit<FormulaFlowProps, "ast" | "flatAst" | "values">;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps, scope } = props;

  const sf = useSheetFlow();

  const [drawerOpen, setDrawerOpen] = useState(true);

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

  const drawerChildren = (
    <DependenciesEditor
      cells={cells}
      namedExpressions={namedExpressions}
      missingSheets={missing.sheets}
      missingNamedExpressions={missing.namedExpressions}
      onCellChange={(address, value) => {
        sf.setCell(sf.stringToCellAddress(address), value);
      }}
      onNamedExpressionChange={(name, value) => {
        sf.setNamedExpression(name, value);
      }}
      onSheetAdd={(name) => {
        sf.addSheet(name);
      }}
      onNamedExpressionAdd={(name) => {
        sf.setNamedExpression(name, "");
      }}
    />
  );

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

        <Paper
          component={Stack}
          className="MuiPaper-pill MuiPaper-forceBorder MuiPaper-absolute"
          sx={{
            "--implicit-height": "48px",
            top: 16,
            left: 16,
            right: 16,
            padding: 0.5,
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
      </Box>
    </Main>
  );
};

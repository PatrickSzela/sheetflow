import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import { PaperTextField } from "@/components/PaperTextField";
import {
  groupReferencesBySheet,
  useFormulaAst,
  useSheetFlow,
} from "@/libs/sheetflow";
import { ErrorOutline } from "@mui/icons-material";
import { Box, Drawer, InputAdornment } from "@mui/material";
import { useMemo, useState } from "react";

export interface FormulaEditorProps {
  scope: string;
  defaultFormula?: string;
  flowProps?: Omit<FormulaFlowProps, "ast" | "flatAst" | "values">;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps, scope } = props;

  const sf = useSheetFlow();

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

  return (
    <Box display="flex" width="100%" height="100%">
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
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
      </Drawer>

      <Box position="relative" flex="1">
        <PaperTextField
          defaultValue={defaultFormula}
          onChange={(e) => {
            setFormula(e.target.value);
          }}
          pill
          size="small"
          error={!!error}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 1,
          }}
          slotProps={{
            ...(error && {
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <ErrorOutline color="error" titleAccess={error} />
                  </InputAdornment>
                ),
              },
            }),
          }}
        />

        <Box width="100%" height="100%">
          <FormulaFlow flatAst={flatAst} values={values} {...flowProps} />
        </Box>
      </Box>
    </Box>
  );
};

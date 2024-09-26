import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import {
  groupReferencesBySheet,
  useFormulaAst,
  useSheetFlow,
} from "@/libs/sheetflow";
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

  // TODO: add info about missing sheets/named expressions
  const { cells, namedExpressions } = useMemo(
    () => groupReferencesBySheet(sf, precedents),
    [sf, precedents]
  );

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={{ width: 300 }}>
        <DependenciesEditor
          cells={cells}
          namedExpressions={namedExpressions}
          onCellChange={(address, value) => {
            sf.setCell(sf.stringToCellAddress(address), value);
          }}
          onNamedExpressionChange={(name, value) => {
            sf.setNamedExpression(name, value);
          }}
        />
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <input
          defaultValue={defaultFormula}
          onChange={(e) => {
            setFormula(e.target.value);
          }}
          style={{
            ...(error && {
              borderColor: "red",
              backgroundColor: "rgba(255,0,0,0.15)",
            }),
          }}
        />

        <div style={{ flex: 1 }}>
          <FormulaFlow flatAst={flatAst} values={values} {...flowProps} />
        </div>
      </main>
    </div>
  );
};

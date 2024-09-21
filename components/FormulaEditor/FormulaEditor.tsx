import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import {
  buildCellAddress,
  CellList,
  NamedExpressions,
  useFormulaAst,
  useSheetFlow,
} from "@/libs/sheetflow";
import { useMemo, useState } from "react";

// TODO: support references without sheet name in address

export interface FormulaEditorProps {
  defaultFormula?: string;
  flowProps?: Omit<FormulaFlowProps, "ast" | "flatAst" | "values">;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps } = props;

  const sf = useSheetFlow();

  const [formula, setFormula] = useState<string>(defaultFormula ?? "");
  const { flatAst, values, precedents = [] } = useFormulaAst(formula);

  const filteredPrecedents = useMemo<{
    cells: CellList;
    namedExpressions: NamedExpressions;
  }>(() => {
    const cells: CellList = {};
    const namedExpressions: NamedExpressions = [];

    for (const precedent of precedents) {
      // TODO: support row/column ranges
      if (typeof precedent === "string") {
        // TODO: add info about missing named expression
        if (!sf.doesNamedExpressionExists(precedent)) continue;

        namedExpressions.push(sf.getNamedExpression(precedent));
      } else if (typeof precedent === "object") {
        if ("column" in precedent) {
          // TODO: add info about missing sheet
          if (!sf.doesSheetExists(precedent.sheet)) continue;

          const stringAddress = sf.cellAddressToString(precedent);
          cells[stringAddress] = sf.getCell(precedent);
        } else if ("start" in precedent) {
          if (!sf.doesSheetExists(precedent.start.sheet)) continue;

          const { start, end } = precedent;

          for (let row = start.row; row <= end.row; row++) {
            for (let col = start.column; col <= end.column; col++) {
              const address = buildCellAddress(col, row, precedent.start.sheet);
              const stringAddress = sf.cellAddressToString(address);
              cells[stringAddress] = sf.getCell(address);
            }
          }
        }
      }
    }

    return { cells, namedExpressions };
  }, [sf, precedents]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={{ width: 300 }}>
        <DependenciesEditor
          cells={filteredPrecedents.cells}
          namedExpressions={filteredPrecedents.namedExpressions}
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
          onChange={(e) => setFormula(e.target.value)}
        />

        <div style={{ flex: 1 }}>
          <FormulaFlow flatAst={flatAst} values={values} {...flowProps} />
        </div>
      </main>
    </div>
  );
};

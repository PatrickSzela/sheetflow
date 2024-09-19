import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import {
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
  const { ast, flatAst, values, precedents } = useFormulaAst(formula);

  const filteredPrecedents = useMemo<{
    cells: CellList;
    namedExpressions: NamedExpressions;
  }>(() => {
    const cells: CellList = {};
    const namedExpressions: NamedExpressions = [];

    for (const precedent of precedents) {
      // TODO: support ranges
      // TODO: deduplicate items
      if (typeof precedent === "object" && "column" in precedent) {
        // TODO: add info about missing sheet
        if (!sf.doesSheetExists(precedent.sheet)) continue;
        const stringAddress = sf.cellAddressToString(precedent);
        cells[stringAddress] = sf.getCell(precedent);
      } else if (typeof precedent === "string") {
        // TODO: add info about missing named expression
        if (!sf.doesNamedExpressionExists(precedent)) continue;
        namedExpressions.push(sf.getNamedExpression(precedent));
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
          <FormulaFlow
            ast={ast}
            flatAst={flatAst}
            values={values}
            {...flowProps}
          />
        </div>
      </main>
    </div>
  );
};

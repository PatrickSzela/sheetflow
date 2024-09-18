import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import { CellList, useFormulaAst, useSheetFlow } from "@/libs/sheetflow";
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

  const cellList = useMemo<CellList>(() => {
    let list: CellList = {};

    for (const address of precedents) {
      // TODO: support ranges
      if ("column" in address) {
        // TODO: add info about missing sheet
        if (!sf.doesSheetExists(address.sheet)) continue;
        const stringAddress = sf.cellAddressToString(address);
        list[stringAddress] = sf.getCell(address);
      }
    }

    return list;
  }, [sf, precedents]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={{ width: 300 }}>
        <DependenciesEditor
          cells={cellList}
          onChange={(address, value) => {
            sf.setCell(sf.stringToCellAddress(address), value);
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

import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaFlow, FormulaFlowProps } from "@/components/FormulaFlow";
import {
  getSheetIdWithError,
  useFormulaAst,
  useHyperFormula,
} from "@/libs/hyperformula";
import { buildStringFromCellAddress, CellList } from "@/libs/sheetflow";
import { SimpleCellAddress } from "hyperformula";
import { useMemo, useState } from "react";

// TODO: support references without sheet name in address

export interface FormulaEditorProps {
  defaultFormula?: string;
  flowProps?: Omit<FormulaFlowProps, "ast" | "flatAst" | "values">;
}

export const FormulaEditor = (props: FormulaEditorProps) => {
  const { defaultFormula, flowProps } = props;
  const hf = useHyperFormula();

  const [formula, setFormula] = useState<string>(defaultFormula ?? "");
  const { ast, flatAst, values, precedents } = useFormulaAst(formula);

  const cellList = useMemo<CellList>(() => {
    let list: CellList = {};

    for (const address of precedents) {
      // TODO: support ranges
      if ("column" in address) {
        const sheetId = hf.getSheetId(address.sheet);

        // TODO: add info about missing sheet
        if (typeof sheetId === "undefined") continue;

        const stringAddress = buildStringFromCellAddress(address);

        list[stringAddress] = hf.getCellSerialized({
          col: address.column,
          row: address.row,
          sheet: sheetId,
        });
      }
    }

    return list;
  }, [hf, precedents]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={{ width: 300 }}>
        <DependenciesEditor
          cells={cellList}
          onChange={(address, value) => {
            const addr: SimpleCellAddress = {
              col: address.column,
              row: address.row,
              sheet: getSheetIdWithError(hf, address.sheet),
            };

            hf.setCellContents(addr, value);
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

import { Ast, flattenAst } from "@/libs/sheetflow";
import { CellValue, ExportedCellChange, SimpleCellAddress } from "hyperformula";
import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";
import { Listeners } from "hyperformula/typings/Emitter";
import { useEffect, useRef, useState } from "react";
import { SHEETFLOW_FORMULAS, useHyperFormula } from "./HyperFormulaProvider";
import { remapAst } from "./remapAst";

export const useFormulaAst = (
  formula: string
): {
  ast: Ast | undefined;
  flatAst: ReturnType<typeof flattenAst> | undefined;
  id: number | undefined;
  values: Record<string, CellValue>;
} => {
  const hf = useHyperFormula();

  const [newFormula, setNewFormula] = useState<string>();
  const [ast, setAst] = useState<Ast>();
  const [flatAst, setFlatAst] = useState<ReturnType<typeof flattenAst>>();
  const id = useRef<number>();
  const flatAst2 = useRef<ReturnType<typeof flattenAst>>();
  const [values, setValues] = useState<Record<string, CellValue>>({});
  const [mounted, setMounted] = useState(false);

  if (newFormula !== formula && hf.validateFormula(formula) && mounted) {
    const formulasSheetId = hf.getSheetId(SHEETFLOW_FORMULAS);

    if (typeof formulasSheetId === "undefined") {
      throw new Error(`The sheet ${SHEETFLOW_FORMULAS} is missing`);
    }

    const row = id.current ?? hf.getSheetDimensions(formulasSheetId).height;

    const address: SimpleCellAddress = {
      col: 0,
      row,
      sheet: formulasSheetId,
    };

    hf.suspendEvaluation();

    // clear out whole row
    hf.removeRows(formulasSheetId, [row, 1]);
    hf.addRows(formulasSheetId, [row, 1]);

    hf.setCellContents(address, hf.normalizeFormula(formula));

    //region get formula's AST
    const formulaVertex = hf.graph.getNodes().find(
      (v) =>
        "formula" in v &&
        "cellAddress" in v &&
        // @ts-expect-error we're using protected property here
        hf.simpleCellAddressToString(v.cellAddress, v.cellAddress.sheet) ==
          hf.simpleCellAddressToString(address, address.sheet)
    ) as FormulaVertex | undefined;

    // @ts-expect-error we're using protected property here
    const hfAst = formulaVertex?.formula;

    if (hfAst) {
      const ast = remapAst(hf, hfAst, address);
      const flatAst = flattenAst(ast);

      // place every element of AST as formula; skip the first element (whole formula) since it's already placed in the first column
      flatAst.slice(1).forEach((ast, idx) => {
        hf.setCellContents(
          { col: idx + 1, row: row, sheet: formulasSheetId },
          `=${ast.rawContent}`
        );
      });

      id.current = row;
      setAst(ast);
      setFlatAst(flatAst);
      flatAst2.current = flatAst;
      setNewFormula(formula);
    }

    hf.resumeEvaluation();
  }

  // TODO: migrate to useSyncExternalStore?
  useEffect(() => {
    // retrieve calculated values
    const func: Listeners["valuesUpdated"] = (changes) => {
      const formulasSheetId = hf.getSheetId(SHEETFLOW_FORMULAS);

      if (typeof id.current === "undefined") return;

      const change = changes.find(
        (change) =>
          "address" in change &&
          change.sheet === formulasSheetId &&
          change.row === id.current
      ) as ExportedCellChange | undefined;

      if (change && flatAst2.current) {
        const formulasSheetId = hf.getSheetId(SHEETFLOW_FORMULAS);

        if (typeof formulasSheetId === "undefined") {
          throw new Error(`The sheet ${SHEETFLOW_FORMULAS} is missing`);
        }

        const vals = hf.getRangeValues({
          start: { col: 0, row: id.current, sheet: formulasSheetId },
          end: {
            col: hf.getSheetDimensions(formulasSheetId).width,
            row: id.current,
            sheet: formulasSheetId,
          },
        })[0];

        setValues(
          Object.fromEntries(
            vals
              .slice(0, flatAst2.current.length)
              .map((val, idx) => [flatAst2.current?.[idx].id, val])
          )
        );
      }
    };

    hf.on("valuesUpdated", func);

    setMounted(true);

    () => {
      hf.off("valuesUpdated", func);
    };
  }, [hf]);

  return { ast, flatAst, id: id.current, values };
};

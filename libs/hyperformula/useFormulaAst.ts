import { Ast, flattenAst } from "@/libs/sheetflow";
import { CellValue, ExportedCellChange, SimpleCellAddress } from "hyperformula";
import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";
import { Listeners } from "hyperformula/typings/Emitter";
import { useEffect, useRef, useState } from "react";
import { useHyperFormula } from "./HyperFormulaProvider";
import { remapAst } from "./remapAst";
import { areHyperFormulaAddressesEqual, getFormulasSheetId } from "./utils";

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
  const [values, setValues] = useState<Record<string, CellValue>>({});
  const [mounted, setMounted] = useState(false);

  // `useRef` to avoid `useEffect` resubscribing to `valuesUpdated` event after it's being triggered internally & using old values because of placing AST elements in the sheet
  const id = useRef<number>();
  const flatAst = useRef<ReturnType<typeof flattenAst>>();

  // place formula in the internal sheet
  if (newFormula !== formula && hf.validateFormula(formula) && mounted) {
    const formulasSheetId = getFormulasSheetId(hf);
    let row = id.current;

    if (typeof row === "undefined") {
      const sheet = hf.getSheetSerialized(formulasSheetId);

      // get first empty row
      const empty = sheet.find(
        (row) => typeof row[0] === "undefined" || row[0] === null
      );

      row = typeof empty === "undefined" ? sheet.length : sheet.indexOf(empty);
    }

    const address: SimpleCellAddress = {
      col: 0,
      row,
      sheet: formulasSheetId,
    };

    hf.suspendEvaluation();

    // clear out the whole row
    hf.removeRows(formulasSheetId, [row, 1]);
    hf.addRows(formulasSheetId, [row, 1]);

    hf.setCellContents(address, hf.normalizeFormula(formula));

    // get formula's AST
    const formulaVertex = hf.graph.getNodes().find((node) => {
      if ("formula" in node && "cellAddress" in node) {
        // @ts-expect-error we're using protected property here
        const cellAddress = node.cellAddress;
        return areHyperFormulaAddressesEqual(cellAddress, address);
      }
    }) as FormulaVertex | undefined;

    // @ts-expect-error we're using protected property here
    const hfAst = formulaVertex?.formula;

    if (!hfAst)
      throw new Error(`Failed to retrieve AST from formula \`${formula}\``);

    const ast = remapAst(hf, hfAst, address);
    const flattenedAst = flattenAst(ast);

    // place every element of AST as formula in the sheet
    // skip the first element (whole formula) since it's already placed in the first column
    flattenedAst.slice(1).forEach((ast, idx) => {
      hf.setCellContents(
        { col: idx + 1, row, sheet: formulasSheetId },
        `=${ast.rawContent}`
      );
    });

    id.current = row;
    flatAst.current = flattenedAst;
    setAst(ast);
    setNewFormula(formula);

    hf.resumeEvaluation();
  }

  // TODO: migrate to useSyncExternalStore?
  useEffect(() => {
    const formulasSheetId = getFormulasSheetId(hf);

    // retrieve calculated values
    const onValuesUpdated: Listeners["valuesUpdated"] = (changes) => {
      if (typeof id.current === "undefined") return;

      const change = changes.find(
        (change) =>
          "address" in change &&
          change.sheet === formulasSheetId &&
          change.row === id.current
      ) as ExportedCellChange | undefined;

      if (change && flatAst.current) {
        const rangeValues = hf.getRangeValues({
          start: { col: 0, row: id.current, sheet: formulasSheetId },
          end: {
            col: flatAst.current.length - 1,
            row: id.current,
            sheet: formulasSheetId,
          },
        })[0];

        const values = Object.fromEntries(
          rangeValues.map((val, idx) => [flatAst.current?.[idx].id, val])
        );

        setValues(values);
      }
    };

    hf.on("valuesUpdated", onValuesUpdated);

    setMounted(true);

    return () => {
      hf.off("valuesUpdated", onValuesUpdated);

      // empty row on component unmount
      if (
        typeof formulasSheetId !== "undefined" &&
        typeof id.current !== "undefined"
      ) {
        hf.suspendEvaluation();

        hf.removeRows(formulasSheetId, [id.current, 1]);
        hf.addRows(formulasSheetId, [id.current, 1]);

        hf.resumeEvaluation();
      }
    };
  }, [hf]);

  return { ast, flatAst: flatAst.current, id: id.current, values };
};

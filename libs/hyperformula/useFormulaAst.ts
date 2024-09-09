import { Ast, flattenAst, Value } from "@/libs/sheetflow";
import { SimpleCellAddress } from "hyperformula";
import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";
import { Listeners } from "hyperformula/typings/Emitter";
import { useEffect, useRef, useState } from "react";
import {
  addFormulasSheet,
  getFormulasSheetId,
  removeFormulasSheets,
} from "./formulasSheet";
import { useHyperFormula } from "./HyperFormulaProvider";
import { remapAst } from "./remapAst";
import { getCellValueDetails, remapCellValue } from "./remapCellValue";
import { areHfAddressesEqual } from "./utils";

// TODO: simplify

export const useFormulaAst = (
  formula: string
): {
  ast: Ast | undefined;
  flatAst: Ast[] | undefined;
  uuid: string | undefined;
  values: Record<string, Value>;
} => {
  const hf = useHyperFormula();

  const [newFormula, setNewFormula] = useState<string>();
  const [ast, setAst] = useState<Ast>();
  const [values, setValues] = useState<Record<string, Value>>({});
  const [mounted, setMounted] = useState(false);

  // `useRef` to avoid `useEffect` resubscribing to `valuesUpdated` event after it's being triggered internally & using old values because of placing AST elements in the sheet
  const id = useRef<string>();
  const flatAst = useRef<Ast[]>();

  const normalizedFormula = hf.validateFormula(formula)
    ? hf.normalizeFormula(formula)
    : undefined;

  // place formulas in the internal sheets
  if (
    mounted &&
    typeof normalizedFormula !== "undefined" &&
    newFormula !== normalizedFormula
  ) {
    hf.suspendEvaluation();

    // remove all previous sheets
    if (typeof id.current !== "undefined") {
      removeFormulasSheets(hf, id.current);
    }

    let uuid = crypto.randomUUID();

    const { sheetId } = addFormulasSheet(hf, uuid, 0, [[normalizedFormula]]);

    const address: SimpleCellAddress = {
      row: 0,
      col: 0,
      sheet: sheetId,
    };

    // get AST of main formula
    const formulaVertex = hf.graph.getNodes().find((node) => {
      if ("formula" in node && "cellAddress" in node) {
        // @ts-expect-error we're using protected property here
        const cellAddress = node.cellAddress;
        return areHfAddressesEqual(cellAddress, address);
      }
    }) as FormulaVertex | undefined;

    // @ts-expect-error we're using protected property here
    const hfAst = formulaVertex?.formula;

    if (!hfAst) {
      throw new Error(`Failed to retrieve AST from formula \`${formula}\``);
    }

    const ast = remapAst(hf, hfAst, address, uuid);
    const flattenedAst = flattenAst(ast);

    // place every element of AST as formula in the sheets
    // skip the first element (whole formula) since it's already placed in the first sheet
    flattenedAst.slice(1).forEach((ast, idx) => {
      addFormulasSheet(hf, uuid, idx + 1, [[`=${ast.rawContent}`]]);
    });

    id.current = uuid;
    flatAst.current = flattenedAst;
    setAst(ast);
    setNewFormula(normalizedFormula);

    hf.resumeEvaluation();
  }

  // TODO: migrate to useSyncExternalStore?
  useEffect(() => {
    // retrieve calculated values
    const onValuesUpdated: Listeners["valuesUpdated"] = (changes) => {
      if (typeof id.current === "undefined") return;

      const uuid = id.current;

      // check if any result of formula's parts have changed
      const change = changes.find((change) => {
        if ("address" in change) {
          const name = hf.getSheetName(change.sheet);
          return name?.includes(uuid);
        }
        return false;
      });

      // retrieve all values
      if (change && flatAst.current) {
        let values: Record<string, Value> = {};

        flatAst.current.forEach((ast, idx) => {
          const id = getFormulasSheetId(hf, uuid, idx);
          const addr: SimpleCellAddress = { col: 0, row: 0, sheet: id };

          // get every value from an array
          if (hf.isCellPartOfArray(addr)) {
            const arrayVertex = hf.arrayMapping.getArrayByCorner(addr);

            if (typeof arrayVertex === "undefined") {
              throw new Error(
                `Unable to retrieve array from cell \`${hf.simpleCellAddressToString(addr, id)}\``
              );
            }

            const { width, height } = arrayVertex;

            const arr = Array(height)
              .fill(null)
              .map(() => Array(width).fill(null));

            for (let row = 0; row < height; row++) {
              for (let col = 0; col < width; col++) {
                arr[row][col] = remapCellValue(
                  getCellValueDetails(hf, { col, row, sheet: id })
                );
              }
            }

            values[ast.id] = arr;
          } else {
            values[ast.id] = remapCellValue(getCellValueDetails(hf, addr));
          }
        });

        setValues(values);
      }
    };

    hf.on("valuesUpdated", onValuesUpdated);

    setMounted(true);

    return () => {
      hf.off("valuesUpdated", onValuesUpdated);

      // empty row on component unmount
      if (typeof id.current !== "undefined") {
        hf.suspendEvaluation();

        removeFormulasSheets(hf, id.current);

        hf.resumeEvaluation();
      }
    };
  }, [hf]);

  return { ast, flatAst: flatAst.current, uuid: id.current, values };
};

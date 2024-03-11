import { Ast } from "@/libs/sheetflow";
import { SimpleCellAddress } from "hyperformula";
import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";
import { useState } from "react";
import { useHyperFormula } from "./HyperFormulaProvider";
import { remapAst } from "./remapAst";

export const useFormulaAst = (formula: string): Ast | undefined => {
  const hf = useHyperFormula();

  const [newFormula, setNewFormula] = useState<string>();
  const [data, setData] = useState<Ast>();

  if (newFormula !== formula && hf.validateFormula(formula)) {
    // TODO: store formula in a custom sheet
    const address: SimpleCellAddress = { col: 9999, row: 9999, sheet: 0 };

    hf.setCellContents(address, hf.normalizeFormula(formula));

    const formulaVertex = hf.graph.getNodes().find(
      (v) =>
        "formula" in v &&
        "cellAddress" in v &&
        // @ts-expect-error we're using protected property here
        hf.simpleCellAddressToString(v.cellAddress, v.cellAddress.sheet) ==
          hf.simpleCellAddressToString(address, address.sheet)
    ) as FormulaVertex | undefined;

    // @ts-expect-error we're using protected property here
    const ast = formulaVertex?.formula;

    if (!ast) return undefined;

    setData(remapAst(hf, ast, address, data));

    setNewFormula(formula);
  }

  return data;
};

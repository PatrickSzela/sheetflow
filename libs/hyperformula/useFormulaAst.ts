import { SimpleCellAddress } from "hyperformula";
import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";
import { useMemo } from "react";
import { useHyperFormula } from "./HyperFormulaProvider";
import { remapAst } from "./remapAst";

export const useFormulaAst = (formula: string) => {
  const hf = useHyperFormula();

  const data = useMemo(() => {
    if (!hf.validateFormula(formula)) return undefined;

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

    return remapAst(hf, ast, address);
  }, [formula, hf]);

  return data;
};

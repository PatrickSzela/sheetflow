import { useEffect, useRef, useState } from "react";
import { Ast } from "./ast";
import { Value } from "./cellValue";
import { Events, Precedents } from "./sheetflow";
import { useSheetFlow } from "./SheetFlowProvider";

export const useFormulaAst = (
  formula: string
): {
  ast: Ast | undefined;
  flatAst: Ast[] | undefined;
  uuid: string | undefined;
  values: Record<string, Value>;
  precedents: Precedents;
} => {
  const sf = useSheetFlow();

  const [newFormula, setNewFormula] = useState<string>();
  const [ast, setAst] = useState<Ast>();
  const [values, setValues] = useState<Record<string, Value>>({});
  const [mounted, setMounted] = useState(false);
  const [precedents, setPrecedents] = useState<Precedents>([]);

  // `useRef` to avoid `useEffect` resubscribing to `valuesUpdated` event after it's being triggered internally & using old values because of placing AST elements in the sheet
  const id = useRef<string>();
  const flattenedAst = useRef<Ast[]>();

  // place formulas in the internal sheets
  if (mounted && newFormula !== formula && sf.isFormulaValid(formula)) {
    sf.pauseEvaluation();

    const { ast, flatAst, uuid } = sf.getFormulaAst(formula, false);
    const precedents = sf.getPrecedents(flatAst);

    sf.placeAst(flatAst.slice(1), uuid);

    id.current = uuid;
    flattenedAst.current = flatAst;
    setAst(ast);
    setNewFormula(formula);
    setPrecedents(precedents);

    sf.resumeEvaluation();
  }

  // TODO: migrate to useSyncExternalStore?
  useEffect(() => {
    // retrieve calculated values
    // TODO: move logic to the wrapper
    const onValuesChanged: Events["valuesChanged"] = (changes) => {
      if (typeof id.current === "undefined") return;

      const uuid = id.current;

      // check if any result of formula's parts have changed
      const change = changes.find((change) => {
        if ("address" in change) {
          return change.address.sheet.includes(uuid);
        }

        return false;
      });

      // retrieve all values
      if (change && flattenedAst.current) {
        const values = sf.getPlacedAstValues(uuid);
        const obj: Record<string, Value> = {};

        flattenedAst.current.forEach((ast, idx) => {
          obj[ast.id] = values[idx];
        });

        setValues(obj);
      }
    };

    sf.on("valuesChanged", onValuesChanged);

    setMounted(true);

    return () => {
      sf.off("valuesChanged", onValuesChanged);

      // empty row on component unmount
      if (typeof id.current !== "undefined") {
        sf.pauseEvaluation();
        sf.removePlacedAst(id.current);
        sf.resumeEvaluation();
      }
    };
  }, [sf]);

  return {
    ast,
    flatAst: flattenedAst.current,
    uuid: id.current,
    values,
    precedents,
  };
};

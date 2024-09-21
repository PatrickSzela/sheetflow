import { useEffect, useState } from "react";
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
  values: Record<string, Value> | undefined;
  precedents: Precedents | undefined;
} => {
  const sf = useSheetFlow();

  const [uuid, setUuid] = useState<string>();
  const [ast, setAst] = useState<Ast>();
  const [flatAst, setFlatAst] = useState<Ast[]>();
  const [values, setValues] = useState<Record<string, Value>>();
  const [precedents, setPrecedents] = useState<Precedents>();

  useEffect(() => {
    if (!sf.isFormulaValid(formula)) {
      return;
    }

    //retrieve AST & place it in sheets
    sf.pauseEvaluation();

    const { ast, flatAst, uuid } = sf.getFormulaAst(formula, undefined, true);
    const precedents = sf.getPrecedents(flatAst);

    sf.resumeEvaluation();

    // retrieve calculated values
    const calculateAst = () => {
      const values = sf.getFormulaAstValues(uuid);
      const obj: Record<string, Value> = {};

      flatAst.forEach((ast, idx) => {
        obj[ast.id] = values[idx];
      });

      return obj;
    };

    const values = calculateAst();

    // TODO: migrate to useSyncExternalStore?
    // listen to changed values
    const onValuesChanged: Events["valuesChanged"] = (changes) => {
      if (sf.isFormulaAstPartOfChanges(uuid, changes)) {
        setValues(calculateAst());
      }
    };

    sf.on("valuesChanged", onValuesChanged);

    setAst(ast);
    setFlatAst(flatAst);
    setUuid(uuid);
    setPrecedents(precedents);
    setValues(values);

    return () => {
      sf.off("valuesChanged", onValuesChanged);

      // remove sheets on component unmount
      sf.pauseEvaluation();
      sf.removeFormulaAst(uuid);
      sf.resumeEvaluation();
    };
  }, [formula, sf]);

  return { ast, flatAst, uuid, values, precedents };
};

import { Reducer, useEffect, useReducer } from "react";
import { Ast } from "./ast";
import { Value } from "./cellValue";
import { Events, Reference } from "./sheetflow";
import { useSheetFlow } from "./SheetFlowProvider";

type Data = {
  uuid?: string;
  ast?: Ast;
  flatAst?: Ast[];
  values?: Record<string, Value>;
  precedents?: Reference[];
  error?: string;
};

type State = {
  data: Data;
  prevFormula?: string;
  validFormula?: string;
};

type Action =
  | { type: "setData"; payload: Required<Omit<Data, "error">> }
  | { type: "setValues"; payload: Data["values"] }
  | { type: "setValidFormula"; payload: string }
  | {
      type: "setInvalidFormula";
      payload: { formula: string; error: Required<Data["error"]> };
    };

const reducer: Reducer<State, Action> = (prevState, action) => {
  const newState = { ...prevState, data: { ...prevState.data } };

  switch (action.type) {
    case "setData":
      newState.data = { ...prevState.data, ...action.payload };
      break;

    case "setValues":
      newState.data.values = action.payload;
      break;

    case "setValidFormula":
      newState.validFormula = action.payload;
      newState.prevFormula = action.payload;
      newState.data.error = undefined;
      break;

    case "setInvalidFormula":
      newState.prevFormula = action.payload.formula;
      newState.data.error = action.payload.error;
      break;
  }

  return newState;
};

const defaultState: State = {
  data: {
    uuid: undefined,
    ast: undefined,
    flatAst: undefined,
    values: undefined,
    precedents: undefined,
    error: undefined,
  },
  prevFormula: undefined,
  validFormula: undefined,
};

export const useFormulaAst = (formula: string): Data => {
  const sf = useSheetFlow();

  const [state, dispatch] = useReducer(reducer, defaultState);
  const { prevFormula, validFormula, data } = state;

  if (prevFormula !== formula) {
    if (!sf.isFormulaValid(formula)) {
      // TODO: better errors
      const error = `Formula \`${formula}\` is not a valid formula`;
      dispatch({ type: "setInvalidFormula", payload: { formula, error } });
    } else {
      dispatch({ type: "setValidFormula", payload: formula });
    }
  }

  useEffect(() => {
    if (!validFormula) return;

    //retrieve AST & place it in sheets
    sf.pauseEvaluation();

    const { ast, flatAst, uuid } = sf.getFormulaAst(validFormula, true);
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

    // TODO: migrate to useSyncExternalStore?
    // listen to changed values
    const onValuesChanged: Events["valuesChanged"] = (changes) => {
      if (sf.isFormulaAstPartOfChanges(uuid, changes)) {
        dispatch({ type: "setValues", payload: calculateAst() });
      }
    };

    sf.on("valuesChanged", onValuesChanged);

    const data = { ast, flatAst, uuid, precedents, values: calculateAst() };
    dispatch({ type: "setData", payload: data });

    return () => {
      sf.off("valuesChanged", onValuesChanged);

      // remove sheets on component unmount
      sf.pauseEvaluation();
      sf.removeFormulaAst(uuid);
      sf.resumeEvaluation();
    };
  }, [validFormula, sf]);

  return data;
};

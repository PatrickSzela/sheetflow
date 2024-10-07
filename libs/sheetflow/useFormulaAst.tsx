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
  render: number;
};

type Action =
  | { type: "setData"; payload: Required<Omit<Data, "error">> }
  | { type: "setValues"; payload: Data["values"] }
  | { type: "setValidFormula"; payload: string }
  | {
      type: "setInvalidFormula";
      payload: { formula: string; error: Required<Data["error"]> };
    }
  | { type: "forceRefresh" };

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

    case "forceRefresh":
      newState.render++;
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
  render: 0,
};

export const useFormulaAst = (formula: string, scope: string): Data => {
  const sf = useSheetFlow();

  const [state, dispatch] = useReducer(reducer, defaultState);
  const { prevFormula, validFormula, data, render } = state;

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

    // retrieve AST & place it in sheets
    sf.pauseEvaluation();

    const { ast, flatAst, uuid } = sf.getFormulaAst(validFormula, scope, true);
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

    const onSheetAdded: Events["sheetAdded"] = (sheet) => {
      // TODO: check if added sheet is used in the formula
      dispatch({ type: "forceRefresh" });
    };

    const onNamedExpressionAdded: Events["namedExpressionAdded"] = (
      namedExpression
    ) => {
      // TODO: check if added named expression is used in the formula
      dispatch({ type: "forceRefresh" });
    };

    sf.on("valuesChanged", onValuesChanged);
    sf.on("sheetAdded", onSheetAdded);
    sf.on("namedExpressionAdded", onNamedExpressionAdded);

    // TODO: very dirty workaround for retrigerring AST generation
    render;

    const data = { ast, flatAst, uuid, precedents, values: calculateAst() };
    dispatch({ type: "setData", payload: data });

    return () => {
      sf.off("valuesChanged", onValuesChanged);
      sf.off("sheetAdded", onSheetAdded);
      sf.off("namedExpressionAdded", onNamedExpressionAdded);

      // remove row on component unmount
      sf.pauseEvaluation();
      sf.removeFormulaAst(uuid);
      sf.resumeEvaluation();
    };
  }, [validFormula, sf, scope, render]);

  return data;
};

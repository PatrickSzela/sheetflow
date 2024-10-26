import { Reducer, useEffect, useReducer } from "react";
import { Ast } from "./ast";
import { Events, Reference } from "./sheetflow";
import { useSheetFlow } from "./SheetFlowProvider";

type Data = {
  uuid?: string;
  ast?: Ast;
  flatAst?: Ast[];
  precedents?: Reference[];
  error?: string;
  missing: { sheets: string[]; namedExpressions: string[] };
};

type State = {
  data: Data;
  prevFormula?: string;
  validFormula?: string;
  render: number;
};

type Action =
  | { type: "setData"; payload: Required<Omit<Data, "error">> }
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
    precedents: undefined,
    error: undefined,
    missing: { namedExpressions: [], sheets: [] },
  },
  prevFormula: undefined,
  validFormula: undefined,
  render: 0,
};

export const useFormulaAst = (formula: string, scope: string): Data => {
  const sf = useSheetFlow();

  const [state, dispatch] = useReducer(reducer, defaultState);
  const { prevFormula, validFormula, data, render } = state;

  useEffect(() => {
    if (prevFormula !== formula) {
      if (!sf.isFormulaValid(formula)) {
        // TODO: better errors
        const error = `Formula \`${formula}\` is not a valid formula`;
        dispatch({ type: "setInvalidFormula", payload: { formula, error } });
      } else {
        dispatch({ type: "setValidFormula", payload: formula });
      }
    }
  }, [formula, prevFormula, sf]);

  useEffect(() => {
    if (!validFormula) return;

    // retrieve AST & place it in sheets
    sf.pauseEvaluation();

    const { ast, flatAst, uuid } = sf.getFormulaAst(validFormula, scope, true);
    const precedents = sf.getPrecedents(flatAst);
    const missing = sf.getMissingSheetsAndNamedExpressions(flatAst);

    sf.resumeEvaluation();

    const data = { ast, flatAst, uuid, precedents, missing };
    dispatch({ type: "setData", payload: data });

    // TODO: very dirty workaround for retriggerring AST generation
    render;

    return () => {
      // remove row on component unmount
      sf.pauseEvaluation();
      sf.removeFormulaAst(uuid);
      sf.resumeEvaluation();
    };
  }, [render, scope, sf, validFormula]);

  useEffect(() => {
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

    sf.on("sheetAdded", onSheetAdded);
    sf.on("namedExpressionAdded", onNamedExpressionAdded);

    return () => {
      sf.off("sheetAdded", onSheetAdded);
      sf.off("namedExpressionAdded", onNamedExpressionAdded);
    };
  }, [sf]);

  return data;
};

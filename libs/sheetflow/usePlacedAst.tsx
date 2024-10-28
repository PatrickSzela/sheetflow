import { Reducer, useEffect, useReducer } from "react";
import { Simplify } from "type-fest";
import { PlacedAst } from "./placedAst";
import { Events } from "./sheetflow";
import { useSheetFlow } from "./SheetFlowProvider";
import { useCreatePlacedAst } from "./useCreatePlacedAst";

type State = {
  placedAst?: PlacedAst;
  error?: string;
  render: number;
};

type Action =
  | { type: "setPlacedAst"; payload: PlacedAst }
  | { type: "setError"; payload: State["error"] }
  | { type: "forceRefresh" };

const reducer: Reducer<State, Action> = (prevState, action) => {
  const newState = { ...prevState, data: { ...prevState.placedAst } };

  switch (action.type) {
    case "setPlacedAst":
      newState.placedAst = action.payload;
      newState.error = undefined;
      break;

    case "setError":
      newState.error = action.payload;
      break;

    case "forceRefresh":
      newState.render++;
      break;
  }

  return newState;
};

const defaultState: State = {
  render: 0,
};

export const usePlacedAst = (
  formula: string,
  scope: string
): Simplify<Omit<State, "render">> => {
  const sf = useSheetFlow();

  const [state, dispatch] = useReducer(reducer, defaultState);
  const { placedAst, error, render } = state;

  const uuid = useCreatePlacedAst();

  // update placed AST
  useEffect(() => {
    if (!uuid || !sf.isAstPlaced(uuid)) return;

    if (!sf.isFormulaValid(formula)) {
      // TODO: better errors
      const error = `Invalid formula`;
      dispatch({ type: "setError", payload: error });
      return;
    }

    const placedAst = sf.getAstFromFormulaAndPlaceIt(uuid, formula, scope);

    dispatch({ type: "setPlacedAst", payload: placedAst });

    // WORKAROUND: very dirty workaround to retrigger AST generation
    render;
  }, [formula, render, scope, sf, uuid]);

  // retrigger AST generation
  useEffect(() => {
    // TODO: check if added sheet is used in the formula
    const onSheetAdded: Events["sheetAdded"] = () => {
      dispatch({ type: "forceRefresh" });
    };

    // TODO: check if added named expression is used in the formula
    const onNamedExpressionAdded: Events["namedExpressionAdded"] = () => {
      dispatch({ type: "forceRefresh" });
    };

    sf.on("sheetAdded", onSheetAdded);
    sf.on("namedExpressionAdded", onNamedExpressionAdded);

    return () => {
      sf.off("sheetAdded", onSheetAdded);
      sf.off("namedExpressionAdded", onNamedExpressionAdded);
    };
  }, [sf]);

  return { placedAst, error };
};

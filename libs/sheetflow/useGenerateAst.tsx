import { Reducer, useEffect, useReducer } from "react";
import { Simplify } from "type-fest";
import { PlacedAst } from "./placedAst";
import { useSheetFlow } from "./SheetFlowProvider";

type State = {
  placedAst?: PlacedAst;
  error?: string;
};

type Action =
  | { type: "setPlacedAst"; payload: PlacedAst | undefined }
  | { type: "setError"; payload: State["error"] };

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
  }

  return newState;
};

const defaultState: State = {};

export const useGenerateAst = (
  formula: string,
  scope: string
): Simplify<Omit<State, "render">> => {
  const sf = useSheetFlow();

  const [state, dispatch] = useReducer(reducer, defaultState);
  const { placedAst, error } = state;

  useEffect(() => {
    const placedAst = sf.createPlacedAst();
    const uuid = placedAst.uuid;

    const updated = () => {
      dispatch({ type: "setPlacedAst", payload: placedAst });
    };

    updated();
    placedAst.on("updated", updated);

    return () => {
      placedAst.off("updated", updated);
      sf.removePlacedAst(uuid);
    };
  }, [sf]);

  // update placed AST
  useEffect(() => {
    if (!placedAst || !sf.isAstPlaced(placedAst.uuid)) return;

    if (!sf.isFormulaValid(formula)) {
      // TODO: better errors
      const error = `Invalid formula`;
      dispatch({ type: "setError", payload: error });
      return;
    }

    sf.getAstFromFormulaAndPlaceIt(placedAst.uuid, formula, scope);
  }, [formula, placedAst, scope, sf]);

  return { placedAst, error };
};

import { useContext } from "react";
import { SheetFlowContext } from "./SheetFlowContext";

export const useSheetFlow = () => {
  const sheetflow = useContext(SheetFlowContext);

  if (!sheetflow)
    throw new Error("Failed to get SheetFlow's engine instance from context");

  return sheetflow;
};

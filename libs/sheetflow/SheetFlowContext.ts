import { createContext } from "react";
import { type SheetFlowEngine } from "./sheetflowEngine";

export const SheetFlowContext = createContext<SheetFlowEngine | null>(null);

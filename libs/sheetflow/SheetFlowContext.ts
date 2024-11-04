import { createContext } from "react";
import { SheetFlowEngine } from "./sheetflowEngine";

export const SheetFlowContext = createContext<SheetFlowEngine | null>(null);

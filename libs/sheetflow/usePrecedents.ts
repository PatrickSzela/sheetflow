import { Reference } from "@/libs/sheetflow/sheetflow";
import { useSheetFlow } from "@/libs/sheetflow/SheetFlowProvider";
import { useEffect, useState } from "react";

// TODO: add `contentChanged` event

export const usePrecedents = (uuid: string): Reference[] => {
  const sf = useSheetFlow();

  const [precedents, setPrecedents] = useState<Reference[]>([]);

  useEffect(() => {
    const { flatAst } = sf.getExistingAstData(uuid) ?? {};
    setPrecedents(flatAst ? sf.getPrecedents(flatAst) : []);
  }, [sf, uuid]);

  return precedents;
};

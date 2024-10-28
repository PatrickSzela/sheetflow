import { useEffect, useState } from "react";
import { AstEvents } from "./placedAst";
import { Reference } from "./reference";
import { useSheetFlow } from "./SheetFlowProvider";

export const usePrecedents = (uuid: string | undefined): Reference[] => {
  const sf = useSheetFlow();

  const [precedents, setPrecedents] = useState<Reference[]>([]);

  useEffect(() => {
    if (!uuid || !sf.isAstPlaced(uuid)) return;

    const placedAst = sf.getPlacedAst(uuid);
    setPrecedents(placedAst.precedents);

    const getPrecedents: AstEvents["updated"] = ({ precedents }) => {
      setPrecedents(precedents);
    };

    placedAst.on("updated", getPrecedents);

    return () => {
      placedAst.off("updated", getPrecedents);
    };
  }, [sf, uuid]);

  return precedents;
};

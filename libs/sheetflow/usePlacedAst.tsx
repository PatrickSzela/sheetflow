import { useEffect, useState } from "react";
import { PlacedAst } from "./placedAst";
import { useSheetFlow } from "./SheetFlowProvider";

export const usePlacedAst = (
  uuid: string | undefined
): PlacedAst | undefined => {
  const sf = useSheetFlow();

  const [placedAst, setPlacedAst] = useState<PlacedAst>();

  useEffect(() => {
    if (!uuid || !sf.isAstPlaced(uuid)) return;

    const placedAst = sf.getPlacedAst(uuid);

    const onUpdated = () => {
      setPlacedAst(placedAst);
    };

    onUpdated();
    placedAst.on("updated", onUpdated);

    return () => {
      placedAst.off("updated", onUpdated);
    };
  }, [sf, uuid]);

  return placedAst;
};

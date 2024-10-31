import { PlacedAst } from "./placedAst";
import { useSheetFlow } from "./SheetFlowProvider";

export const usePlacedAst = (
  uuid: string | undefined
): PlacedAst | undefined => {
  const sf = useSheetFlow();

  if (!uuid || !sf.isAstPlaced(uuid)) {
    return undefined;
  }

  return sf.getPlacedAst(uuid);
};

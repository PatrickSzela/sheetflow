import { useEffect, useState } from "react";
import { useSheetFlow } from "./SheetFlowProvider";

export const useCreatePlacedAst = () => {
  const sf = useSheetFlow();

  const [uuid, setUuid] = useState<string>();

  useEffect(() => {
    const { uuid } = sf.createPlacedAst();
    setUuid(uuid);

    return () => {
      sf.removePlacedAst(uuid);
      setUuid(undefined);
    };
  }, [sf]);

  return uuid;
};

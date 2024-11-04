import { useCallback, useEffect, useState } from "react";
import { CellContent } from "./cell";
import { isCellAddress } from "./cellAddress";
import { isCellRange } from "./cellRange";
import { Reference } from "./reference";
import { useSheetFlow } from "./useSheetFlow";

export const useContent = (
  reference: Reference,
  scope?: string
): {
  content: CellContent | undefined;
  setContent: (content: CellContent) => void;
} => {
  const sf = useSheetFlow();

  const [content, setContent] = useState<CellContent>();

  const setSfContent = useCallback(
    (content: CellContent) => {
      setContent(content);

      if (isCellAddress(reference)) {
        sf.setCell(reference, content);
      } else if (isCellRange(reference)) {
        // FIXME: implement cell range
        throw new Error("Cell range not yet implemented");
      } else {
        sf.setNamedExpression(reference, content, scope);
      }
    },
    [reference, scope, sf]
  );

  useEffect(() => {
    // TODO: create `ContentChanged` event in SheetFlow

    if (isCellAddress(reference)) {
      setContent(sf.getCell(reference));
    } else if (isCellRange(reference)) {
      // FIXME: implement cell range
      throw new Error("Cell range not yet implemented");
    } else {
      setContent(sf.getNamedExpression(reference, scope).expression);
    }
  }, [reference, scope, sf]);

  return {
    content,
    setContent: setSfContent,
  };
};

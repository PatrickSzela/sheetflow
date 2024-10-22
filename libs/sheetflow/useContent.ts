import { useCallback, useEffect, useState } from "react";
import { useSheetFlow } from "./SheetFlowProvider";
import { CellContent } from "./cell";
import { CellAddress, isCellAddress } from "./cellAddress";

export const useContent = (
  addressOrNamedExpressionName: CellAddress | string,
  scope?: string
): {
  content: CellContent | undefined;
  setContent: (content: CellContent) => void;
} => {
  const sf = useSheetFlow();

  const [content, setContent] = useState<CellContent>();
  const isAddress = isCellAddress(addressOrNamedExpressionName);

  const setSfContent = useCallback(
    (content: CellContent) => {
      setContent(content);

      if (isAddress) {
        sf.setCell(addressOrNamedExpressionName, content);
      } else {
        sf.setNamedExpression(addressOrNamedExpressionName, content, scope);
      }
    },
    [addressOrNamedExpressionName, isAddress, scope, sf]
  );

  useEffect(() => {
    // TODO: create `ContentChanged` event in SheetFlow

    setContent(
      isAddress
        ? sf.getCell(addressOrNamedExpressionName)
        : sf.getNamedExpression(addressOrNamedExpressionName, scope).expression
    );
  }, [addressOrNamedExpressionName, isAddress, scope, sf]);

  return {
    content,
    setContent: setSfContent,
  };
};

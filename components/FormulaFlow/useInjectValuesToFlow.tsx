import { AstNode } from "@/components/nodes";
import { Ast, Events, useSheetFlow } from "@/libs/sheetflow";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { injectValuesToFlow } from "./generateFlow";

export const useInjectValuesToFlow = (
  uuid: string | undefined,
  flatAst: Ast[] | undefined,
  isLayoutReady: boolean
): void => {
  const sf = useSheetFlow();
  const { updateNodeData, getNodes } = useReactFlow<AstNode>();

  useEffect(() => {
    if (!uuid || !flatAst || !isLayoutReady) return;

    const injectValues = () => {
      if (!sf.isAstPlaced(uuid)) return;

      const values = sf.getFormulaAstValues(uuid);
      const [_nodes] = injectValuesToFlow(values, getNodes());

      for (const node of _nodes ?? []) {
        updateNodeData(node.id, node.data);
      }
    };

    injectValues();

    const onValuesChanged: Events["valuesChanged"] = (changes) => {
      if (sf.isAstPlaced(uuid) && sf.isFormulaAstPartOfChanges(uuid, changes)) {
        injectValues();
      }
    };

    sf.on("valuesChanged", onValuesChanged);

    return () => {
      sf.off("valuesChanged", onValuesChanged);
    };
  }, [flatAst, getNodes, isLayoutReady, sf, updateNodeData, uuid]);
};

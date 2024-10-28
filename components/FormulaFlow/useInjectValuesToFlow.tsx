import { AstNode } from "@/components/nodes";
import { AstEvents, useSheetFlow } from "@/libs/sheetflow";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { injectValuesToFlow } from "./generateFlow";

// TODO: simplify

export const useInjectValuesToFlow = (uuid: string | undefined): void => {
  const sf = useSheetFlow();
  const { updateNodeData, getNodes } = useReactFlow<AstNode>();

  useEffect(() => {
    if (!uuid || !sf.isAstPlaced(uuid)) return;

    const placedAst = sf.getPlacedAst(uuid);

    const onValuesChanged: AstEvents["valuesChanged"] = (values) => {
      if (!sf.isAstPlaced(uuid)) return;

      const [nodes = []] = injectValuesToFlow(values, getNodes());

      for (const node of nodes) {
        updateNodeData(node.id, node.data);
      }
    };

    placedAst.on("valuesChanged", onValuesChanged);

    return () => {
      placedAst.off("valuesChanged", onValuesChanged);
    };
  }, [getNodes, sf, updateNodeData, uuid]);
};

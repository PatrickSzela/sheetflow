import { AstNode } from "@/components/nodes";
import { PlacedAst, PlacedAstEvents } from "@/libs/sheetflow";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { injectValuesToFlow } from "./generateFlow";

// TODO: simplify

export const useInjectValuesToFlow = (placedAst: PlacedAst): void => {
  const { updateNodeData, getNodes } = useReactFlow<AstNode>();

  useEffect(() => {
    const onValuesChanged: PlacedAstEvents["valuesChanged"] = (values) => {
      const [nodes = []] = injectValuesToFlow(values, getNodes());

      for (const node of nodes) {
        updateNodeData(node.id, node.data);
      }
    };

    placedAst.on("valuesChanged", onValuesChanged);

    return () => {
      placedAst.off("valuesChanged", onValuesChanged);
    };
  }, [getNodes, placedAst, updateNodeData]);
};

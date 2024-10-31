import { AstNode } from "@/components/nodes";
import { PlacedAst, PlacedAstEvents, usePlacedAst } from "@/libs/sheetflow";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { injectValuesToFlow } from "./generateFlow";

// TODO: simplify

export const useInjectValuesToFlow = (
  placedAst: PlacedAst | string | undefined
): void => {
  const uuid = typeof placedAst === "string" ? placedAst : placedAst?.uuid;

  const { updateNodeData, getNodes } = useReactFlow<AstNode>();
  const _placedAst = usePlacedAst(uuid);

  useEffect(() => {
    if (!_placedAst) return;

    const onValuesChanged: PlacedAstEvents["valuesChanged"] = (values) => {
      const [nodes = []] = injectValuesToFlow(values, getNodes());

      for (const node of nodes) {
        updateNodeData(node.id, node.data);
      }
    };

    _placedAst.on("valuesChanged", onValuesChanged);

    return () => {
      _placedAst.off("valuesChanged", onValuesChanged);
    };
  }, [getNodes, _placedAst, updateNodeData]);
};

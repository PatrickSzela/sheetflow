import { AstNode, NODE_SETTINGS } from "@/components/nodes";
import { PlacedAst, usePlacedAstData, useSheetFlow } from "@/libs/sheetflow";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { generateElkLayout } from "./elkLayout";
import {
  generateEdges,
  generateNodes,
  injectValuesToFlow,
} from "./generateFlow";

export const useGenerateFlow = (
  placedAst: PlacedAst,
  skipParenthesis?: boolean,
  skipValues?: boolean
): void => {
  const sf = useSheetFlow();
  const { setEdges, setNodes } = useReactFlow<AstNode>();

  const { uuid } = placedAst;
  const { flatAst } = usePlacedAstData(placedAst);

  useEffect(() => {
    if (!sf.isAstPlaced(uuid)) return;

    let ignoreLayout = false;

    const nodes = generateNodes(
      flatAst,
      NODE_SETTINGS,
      skipParenthesis,
      skipValues
    );
    const edges = generateEdges(flatAst, skipParenthesis, skipValues);

    const generateLayout = async () => {
      let elkNodes = await generateElkLayout(nodes, edges);

      if (ignoreLayout || !sf.isAstPlaced(uuid)) return;

      const { values } = sf.getPlacedAst(uuid);

      console.log("Generated nodes", elkNodes);
      console.log("Generated edges", edges);

      elkNodes = injectValuesToFlow(values, elkNodes)[0] ?? elkNodes;

      setNodes(elkNodes);
      setEdges(edges);
    };

    generateLayout();

    return () => {
      ignoreLayout = true;
    };
  }, [flatAst, setEdges, setNodes, sf, skipParenthesis, skipValues, uuid]);
};

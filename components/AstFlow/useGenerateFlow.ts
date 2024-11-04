import { AstNode } from "@/components/nodes";
import { Ast } from "@/libs/sheetflow";
import { Edge, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { generateElkLayout } from "./elkLayout";
import { generateEdges, generateNodes } from "./generateFlow";

export const useGenerateFlow = (
  flatAst: Ast[],
  skipParenthesis?: boolean,
  skipValues?: boolean,
  enhanceGeneratedFlow?: (
    nodes: AstNode[],
    edges: Edge[]
  ) => { nodes: AstNode[]; edges: Edge[] }
): void => {
  const { setEdges, setNodes } = useReactFlow<AstNode>();

  useEffect(() => {
    let ignoreLayout = false;

    const initNodes = generateNodes(
      flatAst,
      AstNode.settings,
      skipParenthesis,
      skipValues
    );
    const initEdges = generateEdges(flatAst, skipParenthesis, skipValues);

    const generateLayout = async () => {
      let nodes = await generateElkLayout(initNodes, initEdges);
      let edges = initEdges;

      if (ignoreLayout) return;

      console.log("Generated nodes", nodes);
      console.log("Generated edges", initEdges);

      if (enhanceGeneratedFlow)
        ({ nodes, edges } = enhanceGeneratedFlow(nodes, edges));

      setNodes(nodes);
      setEdges(edges);
    };

    void generateLayout();

    return () => {
      ignoreLayout = true;
    };
  }, [
    flatAst,
    enhanceGeneratedFlow,
    setEdges,
    setNodes,
    skipParenthesis,
    skipValues,
  ]);
};

import { AstNode, nodeTypes } from "@/components/nodes";
import { PlacedAst } from "@/libs/sheetflow";
import { useColorScheme } from "@mui/material";
import {
  Background,
  Controls,
  Edge,
  FitViewOptions,
  ReactFlow,
  ReactFlowProps,
} from "@xyflow/react";
import { useGenerateFlow } from "./useGenerateFlow";
import { useHighlightNodes } from "./useHighlightNodes";
import { useInjectValuesToFlow } from "./useInjectValuesToFlow";

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export interface FormulaFlowProps<
  TNode extends AstNode = AstNode,
  TEdge extends Edge = Edge
> extends Omit<ReactFlowProps<TNode, TEdge>, "nodes"> {
  placedAst: PlacedAst;
  skipParenthesis?: boolean;
  skipValues?: boolean;
}

export const FormulaFlow = (props: FormulaFlowProps) => {
  const { placedAst, skipParenthesis, skipValues, ...otherProps } = props;

  const { mode, systemMode } = useColorScheme();

  useGenerateFlow(placedAst, skipParenthesis, skipValues);
  useInjectValuesToFlow(placedAst);
  useHighlightNodes();

  return (
    <ReactFlow
      defaultNodes={[]}
      defaultEdges={[]}
      nodeTypes={nodeTypes}
      colorMode={mode ?? systemMode ?? "system"}
      nodesConnectable={false}
      elevateNodesOnSelect
      elevateEdgesOnSelect
      fitView
      minZoom={0.5}
      maxZoom={1.5}
      fitViewOptions={fitViewOptions}
      // onlyRenderVisibleElements
      {...otherProps}
    >
      <Controls fitViewOptions={fitViewOptions} />
      <Background />
    </ReactFlow>
  );
};

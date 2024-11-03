import { AstNode, nodeTypes } from "@/components/nodes";
import { Ast } from "@/libs/sheetflow";
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

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export interface AstFlowProps<
  TNode extends AstNode = AstNode,
  TEdge extends Edge = Edge
> extends Omit<ReactFlowProps<TNode, TEdge>, "nodes"> {
  flatAst: Ast[];
  skipParenthesis?: boolean;
  skipValues?: boolean;
  enhanceGeneratedFlow?: (
    nodes: AstNode[],
    edges: Edge[]
  ) => { nodes: AstNode[]; edges: Edge[] };
}

export const AstFlow = (props: AstFlowProps) => {
  const {
    flatAst,
    skipParenthesis,
    skipValues,
    enhanceGeneratedFlow,
    ...otherProps
  } = props;

  const { mode, systemMode } = useColorScheme();

  useGenerateFlow(flatAst, skipParenthesis, skipValues, enhanceGeneratedFlow);
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

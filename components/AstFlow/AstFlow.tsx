import { useCallback } from "react";
import { useColorScheme } from "@mui/material/styles";
import {
  Background,
  Controls,
  ReactFlow,
  applyNodeChanges,
  type Edge,
  type FitViewOptions,
  type OnNodesChange,
  type ReactFlowProps,
} from "@xyflow/react";
import { AstNode } from "@/components/nodes";
import { usePlacedAstFlow, type PlacedAst } from "@/libs/sheetflow";
import { useHighlightNodes } from "./useHighlightNodes";

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeTypes = {
  ast: AstNode,
};

export interface AstFlowProps<
  TNode extends AstNode = AstNode,
  TEdge extends Edge = Edge,
> extends Omit<ReactFlowProps<TNode, TEdge>, "nodes"> {
  placedAst: PlacedAst;
}

export const AstFlow = (props: AstFlowProps) => {
  const { placedAst, ...otherProps } = props;

  const { mode, systemMode } = useColorScheme();
  const { nodes, edges } = usePlacedAstFlow(placedAst);

  const onNodesChange: OnNodesChange<AstNode> = useCallback(
    (changes) => {
      placedAst.updateNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, placedAst],
  );

  useHighlightNodes();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
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
      <Background
        // id required for proper support of multiple background on the same page
        id={placedAst.id}
      />
    </ReactFlow>
  );
};

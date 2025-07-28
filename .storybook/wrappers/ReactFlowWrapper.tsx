import { useColorScheme } from "@mui/material";
import {
  Background,
  ReactFlow,
  type Edge,
  type Node,
  type ReactFlowProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

export const ReactFlowWrapper = <TNode extends Node, TEdge extends Edge>(
  props: ReactFlowProps<TNode, TEdge>,
) => {
  const { children, ...rest } = props;

  const { mode, systemMode } = useColorScheme();

  return (
    <ReactFlow
      colorMode={mode ?? systemMode ?? "system"}
      nodesConnectable={false}
      elevateNodesOnSelect
      elevateEdgesOnSelect
      fitView
      {...rest}
    >
      <Background />
      {children}
    </ReactFlow>
  );
};

import { CommonNodeData } from "@/components/nodes";
import { Node, useNodesState } from "@xyflow/react";
import { useMemo, useState } from "react";
import { ReactFlowWrapper } from "../ReactFlowWrapper";
import { NodeWrapperProps } from "./NodeWrapper.args";

const generateNodesFromNodeData = <T extends CommonNodeData>(
  data: T
): Node[] => [{ data, id: "", position: { x: 0, y: 0 }, type: "node" }];

export const NodeWrapper = <T extends NodeWrapperProps>(props: T) => {
  const { node } = props;

  const nodeTypes = useMemo(() => ({ node }), [node]);

  const initialNodes = useMemo<Node[]>(
    () => generateNodesFromNodeData(props),
    [props]
  );

  const [prevProps, setPrevProps] = useState<T>(props);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);

  if (prevProps !== props) {
    setPrevProps(props);
    setNodes(generateNodesFromNodeData(props));
  }

  return (
    <ReactFlowWrapper
      nodes={nodes}
      onNodesChange={onNodesChange}
      nodeTypes={nodeTypes}
    />
  );
};

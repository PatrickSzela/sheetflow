import { CommonNodeData } from "@/components/nodes";
import { ArgTypes } from "@storybook/react";
import { Node, NodeTypes, useNodesState } from "@xyflow/react";
import { useMemo, useState } from "react";
import { ReactFlowWrapper } from "./ReactFlowWrapper";

const generateNodesFromNodeData = <T extends CommonNodeData>(
  data: T
): Node[] => [{ data, id: "", position: { x: 0, y: 0 }, type: "node" }];

export type NodeWrapperProps = CommonNodeData & { node: NodeTypes[string] };

export const NodeWrapperArgTypes: Partial<ArgTypes<NodeWrapperProps>> = {
  node: { table: { disable: true } },
};

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

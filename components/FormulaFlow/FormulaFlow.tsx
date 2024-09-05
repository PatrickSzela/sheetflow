import { BaseNode, nodeTypes } from "@/components/nodes";
import { Ast, CellValue, flattenAst } from "@/libs/sheetflow";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  OnSelectionChangeFunc,
  ReactFlow,
  ReactFlowProps,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useRef, useState } from "react";
import { generateElkLayout } from "./elkLayout";
import {
  generateEdges,
  generateNodes,
  injectValuesToFlow,
} from "./generateFlow";

import "@xyflow/react/dist/style.css";

// TODO: cleanup

export interface FormulaFlowProps<
  TNode extends BaseNode = BaseNode,
  TEdge extends Edge = Edge,
> extends Omit<ReactFlowProps<TNode, TEdge>, "nodes"> {
  ast: Ast | undefined;
  flatAst: Ast[] | undefined;
  values: Record<string, CellValue> | undefined;
  skipParenthesis?: Boolean;
}

export const FormulaFlow = (props: FormulaFlowProps) => {
  return (
    <ReactFlowProvider>
      <FormulaFlowInner {...props} />
    </ReactFlowProvider>
  );
};

const FormulaFlowInner = (props: FormulaFlowProps) => {
  const { ast, flatAst, values, skipParenthesis, ...otherProps } = props;

  const prevAst = useRef<Ast>();
  const prevSkipParenthesis = useRef<Boolean>();
  const prevValues = useRef<Record<string, CellValue>>();

  const generatingLayout = useRef(0); // to avoid race conditions

  const [nodes, setNodes, _onNodesChange] = useNodesState<BaseNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { updateNodeData } = useReactFlow<BaseNode>();

  const [prevHighlightedAst, setPrevHighlightedAst] = useState<Ast[]>([]);

  const updateFlowWithValues = (
    nodes: BaseNode[],
    edges: Edge[],
    values: Record<string, CellValue>
  ) => {
    const [newNodes, newEdges] = injectValuesToFlow(nodes, edges, values);

    setNodes(newNodes);
    setEdges(newEdges);

    prevValues.current = values;
  };

  // on ast/skipParenthesis change
  if (
    flatAst &&
    values &&
    (prevAst.current !== ast || prevSkipParenthesis.current !== skipParenthesis)
  ) {
    prevAst.current = ast;
    prevSkipParenthesis.current = skipParenthesis;
    generatingLayout.current++;

    const nodes = generateNodes(flatAst, skipParenthesis);
    const edges = generateEdges(flatAst, skipParenthesis);

    generateElkLayout(nodes, edges).then((nodes) => {
      console.log("Generated nodes", nodes);
      console.log("Generated edges", edges);

      updateFlowWithValues(nodes, edges, values);

      generatingLayout.current--;
    });
  }

  // on values updated
  if (
    values &&
    nodes.length &&
    generatingLayout.current === 0 &&
    prevValues.current !== values
  ) {
    console.log("Updating values...");
    updateFlowWithValues(nodes, edges, values);
  }

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ edges, nodes: _nodes }) => {
      // `OnSelectionChangeFunc` isn't a generic type
      const nodes = _nodes as BaseNode[];
      let arr = prevHighlightedAst;

      for (const ast of arr) {
        updateNodeData(ast.id, { highlighted: false });
      }

      arr = [];

      for (const node of nodes) {
        const flatAst = flattenAst(node.data.ast);

        arr = [...arr, ...flatAst];

        for (const child of flatAst) {
          updateNodeData(child.id, { highlighted: true });
        }
      }

      setPrevHighlightedAst(arr);
    },
    [prevHighlightedAst, updateNodeData]
  );

  useOnSelectionChange({ onChange: onSelectionChange });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={_onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      colorMode="system"
      nodesConnectable={false}
      elevateNodesOnSelect
      elevateEdgesOnSelect
      fitView
      onlyRenderVisibleElements
      {...otherProps}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

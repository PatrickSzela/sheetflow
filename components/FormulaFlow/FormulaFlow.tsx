import { BaseNode, nodeTypes } from "@/components/nodes";
import { Ast, flattenAst, Value } from "@/libs/sheetflow";
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
import { useCallback, useEffect, useRef, useState } from "react";
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
  TEdge extends Edge = Edge
> extends Omit<ReactFlowProps<TNode, TEdge>, "nodes"> {
  ast: Ast | undefined;
  flatAst: Ast[] | undefined;
  values: Record<string, Value> | undefined;
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

  const [rfNodes, setRFNodes, onRFNodesChange] = useNodesState<BaseNode>([]);
  const [rfEdges, setRFEdges, onRFEdgesChange] = useEdgesState<Edge>([]);
  const { updateNodeData } = useReactFlow<BaseNode>();

  const [nodes, setNodes] = useState<BaseNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [prevHighlightedAst, setPrevHighlightedAst] = useState<Ast[]>([]);

  // useRef to avoid rerendering flow while nodes & edges don't have values injected yet
  const generatingLayout = useRef(true);

  // generate layout
  useEffect(() => {
    if (!flatAst) return;

    generatingLayout.current = true;

    let ignoreLayout = false;

    const nodes = generateNodes(flatAst, skipParenthesis);
    const edges = generateEdges(flatAst, skipParenthesis);

    const generateLayout = async () => {
      const elkNodes = await generateElkLayout(nodes, edges);

      if (ignoreLayout) return;

      console.log("Generated nodes", elkNodes);
      console.log("Generated edges", edges);

      setNodes(elkNodes);
      setEdges(edges);

      generatingLayout.current = false;
    };

    generateLayout();

    return () => {
      ignoreLayout = true;
    };
  }, [flatAst, skipParenthesis]);

  // inject calculated values to layout and place it
  useEffect(() => {
    if (!values || generatingLayout.current) return;

    const [newNodes, newEdges] = injectValuesToFlow(nodes, edges, values);

    setRFNodes(newNodes);
    setRFEdges(newEdges);
  }, [edges, nodes, setRFEdges, setRFNodes, values]);

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
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={onRFNodesChange}
      onEdgesChange={onRFEdgesChange}
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

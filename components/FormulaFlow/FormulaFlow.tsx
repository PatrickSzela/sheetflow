import { AstNode, NODE_SETTINGS, nodeTypes } from "@/components/nodes";
import { Ast, flattenAst } from "@/libs/sheetflow";
import { useColorScheme } from "@mui/material";
import {
  Background,
  Controls,
  Edge,
  FitViewOptions,
  OnSelectionChangeFunc,
  ReactFlow,
  ReactFlowProps,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { generateElkLayout } from "./elkLayout";
import { generateEdges, generateNodes } from "./generateFlow";
import { useInjectValuesToFlow } from "./useInjectValuesToFlow";

import "@xyflow/react/dist/style.css";

// TODO: cleanup

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export interface FormulaFlowProps<
  TNode extends AstNode = AstNode,
  TEdge extends Edge = Edge
> extends Omit<ReactFlowProps<TNode, TEdge>, "nodes"> {
  uuid: string | undefined;
  flatAst: Ast[] | undefined;
  skipParenthesis?: Boolean;
  skipValues?: Boolean;
}

export const FormulaFlow = (props: FormulaFlowProps) => {
  return (
    <ReactFlowProvider>
      <FormulaFlowInner {...props} />
    </ReactFlowProvider>
  );
};

const FormulaFlowInner = (props: FormulaFlowProps) => {
  const { flatAst, uuid, skipParenthesis, skipValues, ...otherProps } = props;

  const { mode, systemMode } = useColorScheme();

  const [rfNodes, setRFNodes, onRFNodesChange] = useNodesState<AstNode>([]);
  const [rfEdges, setRFEdges, onRFEdgesChange] = useEdgesState<Edge>([]);
  const { updateNodeData } = useReactFlow<AstNode>();

  const [prevUuid, setPrevUuid] = useState<string>();
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [prevHighlightedAst, setPrevHighlightedAst] = useState<Ast[]>([]);

  if (uuid && prevUuid !== uuid) {
    setPrevUuid(uuid);
    setIsLayoutReady(false);
  }

  // generate layout
  useEffect(() => {
    if (!flatAst || !uuid) return;

    let ignoreLayout = false;

    const nodes = generateNodes(
      flatAst,
      NODE_SETTINGS,
      skipParenthesis,
      skipValues
    );
    const edges = generateEdges(flatAst, skipParenthesis, skipValues);

    const generateLayout = async () => {
      const elkNodes = await generateElkLayout(nodes, edges);

      if (ignoreLayout) return;

      console.log("Generated nodes", elkNodes);
      console.log("Generated edges", edges);

      setRFNodes(elkNodes);
      setRFEdges(edges);

      setIsLayoutReady(true);
    };

    generateLayout();

    return () => {
      ignoreLayout = true;
    };
  }, [flatAst, setRFEdges, setRFNodes, skipParenthesis, skipValues, uuid]);

  useInjectValuesToFlow(uuid, flatAst, isLayoutReady);

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ edges, nodes: _nodes }) => {
      // `OnSelectionChangeFunc` isn't a generic type
      const nodes = _nodes as AstNode[];
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

import { AstNode, NODE_SETTINGS, nodeTypes } from "@/components/nodes";
import { Ast, flattenAst, usePlacedAst, useSheetFlow } from "@/libs/sheetflow";
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
import {
  generateEdges,
  generateNodes,
  injectValuesToFlow,
} from "./generateFlow";
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
  const { uuid, skipParenthesis, skipValues, ...otherProps } = props;

  const sf = useSheetFlow();
  const placedAst = usePlacedAst(uuid);
  const { mode, systemMode } = useColorScheme();
  const { updateNodeData } = useReactFlow<AstNode>();

  const [nodes, setNodes, onNodesChange] = useNodesState<AstNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [prevHighlightedAst, setPrevHighlightedAst] = useState<Ast[]>([]);

  const { flatAst } = placedAst ?? {};

  // generate layout
  useEffect(() => {
    if (!uuid || !flatAst || !sf.isAstPlaced(uuid)) return;

    let ignoreLayout = false;

    const nodes = generateNodes(
      flatAst,
      NODE_SETTINGS,
      skipParenthesis,
      skipValues
    );
    const edges = generateEdges(flatAst, skipParenthesis, skipValues);

    const generateLayout = async () => {
      let elkNodes = await generateElkLayout(nodes, edges);

      if (ignoreLayout || !sf.isAstPlaced(uuid)) return;

      console.log("Generated nodes", elkNodes);
      console.log("Generated edges", edges);

      const { values } = sf.getPlacedAst(uuid);

      if (values) {
        elkNodes = injectValuesToFlow(values, elkNodes)[0] ?? elkNodes;
      }

      setNodes(elkNodes);
      setEdges(edges);
    };

    generateLayout();

    return () => {
      ignoreLayout = true;
    };
  }, [flatAst, setEdges, setNodes, sf, skipParenthesis, skipValues, uuid]);

  useInjectValuesToFlow(uuid);

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
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
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

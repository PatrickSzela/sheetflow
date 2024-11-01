import { AstNode, NODE_SETTINGS, nodeTypes } from "@/components/nodes";
import {
  Ast,
  flattenAst,
  PlacedAst,
  usePlacedAstData,
  useSheetFlow,
} from "@/libs/sheetflow";
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
  placedAst: PlacedAst;
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
  const { placedAst, skipParenthesis, skipValues, ...otherProps } = props;

  const sf = useSheetFlow();
  const { mode, systemMode } = useColorScheme();
  const { updateNodeData } = useReactFlow<AstNode>();

  const [nodes, setNodes, onNodesChange] = useNodesState<AstNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [prevHighlightedAst, setPrevHighlightedAst] = useState<Ast[]>([]);

  const { uuid } = placedAst;
  const { flatAst } = usePlacedAstData(placedAst);

  // generate layout
  useEffect(() => {
    if (!sf.isAstPlaced(uuid)) return;

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

      const { values } = sf.getPlacedAst(uuid);

      console.log("Generated nodes", elkNodes);
      console.log("Generated edges", edges);

      elkNodes = injectValuesToFlow(values, elkNodes)[0] ?? elkNodes;

      setNodes(elkNodes);
      setEdges(edges);
    };

    generateLayout();

    return () => {
      ignoreLayout = true;
    };
  }, [flatAst, setEdges, setNodes, sf, skipParenthesis, skipValues, uuid]);

  useInjectValuesToFlow(placedAst);

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

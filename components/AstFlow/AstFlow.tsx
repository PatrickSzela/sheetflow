import { Ast, AstNodeType, flattenAst } from "@/libs/sheetflow";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  Position,
  ReactFlow,
  ReactFlowProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK, { ElkExtendedEdge, ElkNode } from "elkjs";
import { useEffect, useMemo } from "react";

export interface AstFlowProps extends Omit<ReactFlowProps, "nodes"> {
  ast: Ast;
}

const layoutOptions = (depth: number) => ({
  "elk.algorithm": "layered",
  "elk.direction": "LEFT",
  // "elk.layered.nodePlacement.networkSimplex.nodeFlexibility.default": "PORT_POSITION",
  "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
  "elk.layered.nodePlacement.bk.edgeStraightening": "NONE",
  "elk.layered.considerModelOrder.strategy": "PREFER_NODES",
  // "elk.partitioning.activate": "true",
  // "elk.partitioning.partition": `${depth}`,
  "elk.layered.nodePlacement.linearSegments.deflectionDampening": "0.5",

  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",

  // "elk.layered.nodePlacement.strategy": "SIMPLE",
  // "elk.layered.nodePlacement.strategy": "LINEAR_SEGMENTS",
  "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
  // "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",

  "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
  // "elk.layered.layering.strategy": "LONGEST_PATH",
  // "elk.layered.layering.strategy": "LONGEST_PATH_SOURCE",
  // "elk.layered.layering.strategy": "COFFMAN_GRAHAM",
  // "elk.layered.layering.strategy": "INTERACTIVE",
  // "elk.layered.layering.strategy": "STRETCH_WIDTH",
  // "elk.layered.layering.strategy": "MIN_WIDTH",
  // "elk.layered.layering.strategy": "BF_MODEL_ORDER",
  // "elk.layered.layering.strategy": "DF_MODEL_ORDER",

  // "elk.layered.layering.nodePromotion.strategy": "NONE",
  // "elk.layered.layering.nodePromotion.strategy": "NIKOLOV",
  // "elk.layered.layering.nodePromotion.strategy": "NIKOLOV_PIXEL",
  // "elk.layered.layering.nodePromotion.strategy": "NIKOLOV_IMPROVED",
  // "elk.layered.layering.nodePromotion.strategy": "NIKOLOV_IMPROVED_PIXEL",
  // "elk.layered.layering.nodePromotion.strategy": "DUMMYNODE_PERCENTAGE",
  // "elk.layered.layering.nodePromotion.strategy": "NODECOUNT_PERCENTAGE",
  // "elk.layered.layering.nodePromotion.strategy": "NO_BOUNDARY",
  // "elk.layered.layering.nodePromotion.strategy": "MODEL_ORDER_LEFT_TO_RIGHT",
  // "elk.layered.layering.nodePromotion.strategy": "MODEL_ORDER_RIGHT_TO_LEFT",
});

export const AstFlow = (props: AstFlowProps) => {
  const { ast, ...otherProps } = props;

  const flatAst = useMemo(() => flattenAst(ast), [ast]);
  const elkjs = useMemo(() => new ELK(), []);

  const initialEdges = useMemo<Edge[]>(() => {
    let arr: Edge[] = [];

    flatAst.forEach((ast) => {
      if (!("children" in ast) || ast.type === AstNodeType.PARENTHESIS) return;

      ast.children.forEach((inner, idx) => {
        const c =
          inner.type === AstNodeType.PARENTHESIS ? inner.children[0] : inner;

        arr = [
          ...arr,
          {
            id: `${ast.id} - ${c.id}`,
            source: ast.id,
            target: c.id,
            // targetHandle: String.fromCharCode("a".charCodeAt(0) + idx),
          },
        ];
      });
    });

    console.log("Edges", arr);

    return arr;
  }, [flatAst]);

  const elkGraph = useMemo<ElkNode>(() => {
    const remapElkGraph = (ast: Ast, depth: number = 0): ElkNode[] => {
      return [
        // // parenthesis as group
        // {
        //   id: ast.id,
        //   width: 200,
        //   height: 80,
        //   layoutOptions: layoutOptions(depth),

        //   ...(ast.type === AstNodeType.PARENTHESIS && {
        //     children: ast.children
        //       .map((i) => remapElkGraph(i, depth + 1))
        //       .flat(),
        //     layoutOptions: layoutOptions(depth),
        //   }),
        // },

        // ...(ast.type !== AstNodeType.PARENTHESIS && "children" in ast
        //   ? ast.children.map((i) => remapElkGraph(i, depth)).flat()
        //   : []),

        // parenthesis ignored
        ...(ast.type === AstNodeType.PARENTHESIS
          ? []
          : [
              {
                id: ast.id,
                width: 200,
                height: 80,
                layoutOptions: layoutOptions(depth),
              },
            ]),

        ...("children" in ast
          ? ast.children.map((i) => remapElkGraph(i, depth)).flat()
          : []),
      ];
    };

    let edges: ElkExtendedEdge[] = [];

    flatAst.forEach((ast) => {
      if (!("children" in ast) || ast.type === AstNodeType.PARENTHESIS) return;

      ast.children.forEach((inner) => {
        // // parenthesis as group
        // const c = inner;

        // parenthesis ignored
        const c =
          inner.type === AstNodeType.PARENTHESIS ? inner.children[0] : inner;

        edges = [
          ...edges,
          {
            id: `${ast.id} - ${c.id}`,
            sources: [ast.id],
            targets: [c.id],
          },
        ];
      });
    });

    const graph: ElkNode = {
      id: "root",
      layoutOptions: {
        ...layoutOptions(0),
        "elk.partitioning.activate": "true",
      },
      children: remapElkGraph(ast),
      edges,
    };

    console.log("Graph", graph);

    return graph;
  }, [ast, flatAst]);

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    elkjs.layout(elkGraph).then((elkLayout) => {
      if (!elkLayout) return;

      const unmapElkLayout = (
        elkLayout: ElkNode[],
        parentNode?: string
      ): Node[] => {
        return elkLayout
          .map((cur) => {
            const ast = flatAst.find((i) => i.id === cur.id);

            // if (!ast) {
            //   return [];
            //   throw new Error(`Not found ${cur.id}`);
            // }

            const node: Node | undefined =
              cur.id !== "root" && ast
                ? {
                    id: cur.id,
                    position: { x: cur.x ?? 0, y: cur.y ?? 0 },
                    data: { label: `${ast.type}: ${ast.rawContent}` },
                    // data: { label: cur.id },
                    width: cur.width || 100,
                    height: cur.height || 100,
                    targetPosition: Position.Right,
                    sourcePosition: Position.Left,

                    ...(parentNode && {
                      parentNode: parentNode,
                      extent: "parent",
                    }),

                    ...(cur.children && { type: "group" }),

                    ...((ast.type === AstNodeType.VALUE ||
                      ast.type === AstNodeType.REFERENCE) && {
                      type: "output",
                    }),
                  }
                : undefined;

            return [
              ...(node ? [node] : []),
              ...(cur.children
                ? unmapElkLayout(
                    cur.children,
                    cur.id !== "root" ? cur.id : undefined
                  )
                : []),
            ];
          })
          .flat();
      };

      const arr = unmapElkLayout([elkLayout]);

      console.log("Nodes", arr);

      setNodes(arr);
    });
  }, [elkGraph, elkjs, flatAst, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      colorMode="system"
      {...otherProps}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

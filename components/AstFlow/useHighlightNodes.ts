import { useCallback, useState } from "react";
import {
  useOnSelectionChange,
  useReactFlow,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import { type AstNode } from "@/components/nodes";
import { flattenAst, type Ast } from "@/libs/sheetflow";

export const useHighlightNodes = () => {
  const { updateNodeData } = useReactFlow<AstNode>();

  const [prevHighlightedAst, setPrevHighlightedAst] = useState<Ast[]>([]);

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes: _nodes }) => {
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
    [prevHighlightedAst, updateNodeData],
  );

  useOnSelectionChange({ onChange: onSelectionChange });
};

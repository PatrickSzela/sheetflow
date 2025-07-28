import { type Node, type NodeProps } from "@xyflow/react";
import { useSheetFlow, type Ast } from "@/libs/sheetflow";
import { BaseNode } from "./BaseNode";
import {
  getNodeDataFromAst,
  type AstNodeValue,
  type CommonNodeData,
} from "./utils";

export type AstNodeData = CommonNodeData & {
  ast: Ast;
  output?: AstNodeValue;
  inputs?: AstNodeValue[];
};
export type AstNode = Node<AstNodeData, "ast">;
export type AstNodeProps = NodeProps<AstNode>;

export const AstNode = (props: AstNodeProps) => {
  const { data, ...otherProps } = props;
  const { ast, inputs, output, ...otherData } = data;

  const sf = useSheetFlow();

  const _data = {
    ...otherData,
    ...getNodeDataFromAst(sf, ast, inputs, output),
  };

  return <BaseNode {...otherProps} type="base" data={_data} />;
};

AstNode.settings = BaseNode.settings;

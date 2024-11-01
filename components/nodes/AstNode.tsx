import { Ast, useSheetFlow } from "@/libs/sheetflow";
import { Node, NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { AstNodeValue, CommonNodeData, getNodeDataFromAst } from "./utils";

export { NODE_SETTINGS } from "./BaseNode";

export type AstNodeData = CommonNodeData & {
  ast: Ast;
  output?: AstNodeValue;
  inputs?: AstNodeValue[];
  highlighted?: boolean;
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

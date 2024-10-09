import { Ast } from "@/libs/sheetflow";
import { Node, NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import {
  AstNodeValue,
  astToColor,
  astToIcon,
  CommonNodeData,
  mergeInputs,
  remapNodeValue,
} from "./utils";

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
  const { ast, inputs: _inputs, output: _output, ...otherData } = data;

  const Icon = astToIcon(ast);
  const color = astToColor(ast);
  const inputs = mergeInputs(ast, _inputs);
  const output = _output ? remapNodeValue(_output) : undefined;

  return (
    <BaseNode
      {...otherProps}
      type="base"
      data={{
        title: `${ast.type}`,
        color,
        icon: <Icon />,
        inputs,
        output,
        ...otherData,
      }}
    />
  );
};

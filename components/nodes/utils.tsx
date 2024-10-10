import { BaseNodeData } from "@/components/nodes/BaseNode";
import {
  Ast,
  AstNodeType,
  isAstWithChildren,
  printCellValue,
  Value,
} from "@/libs/sheetflow";
import Add from "@mui/icons-material/Add";
import DataArray from "@mui/icons-material/DataArray";
import FormatShapes from "@mui/icons-material/FormatShapes";
import Functions from "@mui/icons-material/Functions";
import PlusOne from "@mui/icons-material/PlusOne";
import SixtyFps from "@mui/icons-material/SixtyFps";
import Tag from "@mui/icons-material/Tag";
import { CSSProperties } from "react";

export type NodeValue = {
  value: string | number | null;
  handleId?: string;
};

export type AstNodeValue = {
  value: Value;
  handleId?: string;
};

export type CommonNodeData = {
  highlighted?: boolean;
};

export type NodeSettingsSpacing = {
  horizontal: number;
  vertical: number;
};

export type NodeSettingsSection = {
  height: number;
  spacing: NodeSettingsSpacing;
};

export type NodeSettings = {
  header: NodeSettingsSection;
  main: NodeSettingsSection;
  footer: NodeSettingsSection;
  value: NodeSettingsSection;
};
export const remapNodeValue = (input: AstNodeValue): NodeValue => ({
  ...input,
  value: printCellValue(input.value),
});

export const mergeInputs = (ast: Ast, inputs?: AstNodeValue[]): NodeValue[] => {
  let result: NodeValue[] = [];

  if (inputs) {
    result = [...result, ...inputs.map(remapNodeValue)];
  }

  return result;
};

export const getNodeDataFromAst = (
  ast: Ast,
  inputs?: AstNodeValue[],
  output?: AstNodeValue
): BaseNodeData => {
  let nodeData: BaseNodeData = {
    title: "",
    inputs: mergeInputs(ast, inputs),
    output: output ? remapNodeValue(output) : undefined,
  };

  switch (ast.type) {
    case AstNodeType.VALUE:
      return {
        ...nodeData,
        title: ast.subtype,
        icon: <SixtyFps />,
        color: "primary",
      };

    case AstNodeType.REFERENCE:
      return {
        ...nodeData,
        title: ast.rawContent,
        icon: <FormatShapes />,
        color: "success",
      };

    case AstNodeType.FUNCTION:
      return {
        ...nodeData,
        title: `${ast.functionName}()`,
        icon: <Functions />,
        color: "info",
      };

    case AstNodeType.UNARY_EXPRESSION:
      return {
        ...nodeData,
        title: ast.operatorOnRight ? `A${ast.operator}` : `${ast.operator}A`,
        icon: <PlusOne />,
        color: "secondary",
      };

    case AstNodeType.BINARY_EXPRESSION:
      return {
        ...nodeData,
        title: `A ${ast.operator} B`,
        icon: <Add />,
        color: "secondary",
      };

    case AstNodeType.PARENTHESIS:
      return {
        ...nodeData,
        title: ast.type,
        icon: <DataArray />,
        color: "warning",
      };

    case AstNodeType.ERROR:
      return {
        ...nodeData,
        title: ast.type,
        icon: <Tag />,
        color: "error",
      };
  }
};

export const getPossibleChildrenCount = (ast: Ast) =>
  isAstWithChildren(ast)
    ? Math.max(ast.children.length, ast.requirements.maxChildCount)
    : 0;

export const nodeSettingToCss = (
  setting: NodeSettingsSection
): CSSProperties => {
  const { height, spacing } = setting;

  return {
    ...(height && {
      height: `${calculateNodeSettingSection(setting)}px`,
    }),
    padding: `${spacing.vertical}px ${spacing.horizontal}px`,
  };
};

export const calculateNodeSettingSection = (
  setting: NodeSettingsSection
): number => {
  const { height, spacing } = setting;
  return height + spacing.vertical * 2;
};

export const calculateNodeSize = (ast: Ast, settings: NodeSettings) => {
  const { header, main, footer, value } = settings;
  const childCount = getPossibleChildrenCount(ast);

  const headerHeight = calculateNodeSettingSection(header);
  const mainHeight =
    calculateNodeSettingSection(main) +
    childCount * calculateNodeSettingSection(value);
  const footerHeight = calculateNodeSettingSection(footer);

  return {
    height: headerHeight + mainHeight + footerHeight,
    width: 150,
  };
};

import { BaseNodeData } from "@/components/nodes/BaseNode";
import {
  Ast,
  AstNodeType,
  isAstWithChildren,
  printCellValue,
  SheetFlowEngine,
  Value,
} from "@/libs/sheetflow";
import Add from "@mui/icons-material/Add";
import DataArray from "@mui/icons-material/DataArray";
import FormatShapes from "@mui/icons-material/FormatShapes";
import Functions from "@mui/icons-material/Functions";
import PlusOne from "@mui/icons-material/PlusOne";
import SixtyFps from "@mui/icons-material/SixtyFps";
import Tag from "@mui/icons-material/Tag";
import React, { CSSProperties } from "react";

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
  value: printCellValue(input.value),
  ...(input.handleId !== undefined && { handleId: input.handleId }),
});

export const getNodeDataFromAst = (
  sf: SheetFlowEngine,
  ast: Ast,
  inputs?: AstNodeValue[],
  output?: AstNodeValue
): BaseNodeData => {
  const nodeData: BaseNodeData = {
    title: "",
    ...(inputs && { inputs: inputs.map(remapNodeValue) }),
    ...(output && { output: remapNodeValue(output) }),
  };

  let error: Partial<BaseNodeData> = {};

  if (nodeData.output && sf.isCalculatedValueAnError(nodeData.output.value)) {
    error = {
      icon: React.createElement(Tag),
      color: "error",
    };
  }

  switch (ast.type) {
    case AstNodeType.VALUE:
      return {
        ...nodeData,
        title: ast.subtype,
        icon: React.createElement(SixtyFps),
        color: "primary",
        ...error,
      };

    case AstNodeType.REFERENCE:
      return {
        ...nodeData,
        title: ast.rawContent,
        icon: React.createElement(FormatShapes),
        color: "success",
        ...error,
      };

    case AstNodeType.FUNCTION:
      return {
        ...nodeData,
        title: `${ast.functionName}()`,
        icon: React.createElement(Functions),
        color: "info",
        ...error,
      };

    case AstNodeType.UNARY_EXPRESSION:
      return {
        ...nodeData,
        title: ast.operatorOnRight ? `A${ast.operator}` : `${ast.operator}A`,
        icon: React.createElement(PlusOne),
        color: "secondary",
        ...error,
      };

    case AstNodeType.BINARY_EXPRESSION:
      return {
        ...nodeData,
        title: `A ${ast.operator} B`,
        icon: React.createElement(Add),
        color: "secondary",
        ...error,
      };

    case AstNodeType.PARENTHESIS:
      return {
        ...nodeData,
        title: ast.type,
        icon: React.createElement(DataArray),
        color: "warning",
        ...error,
      };

    case AstNodeType.ERROR:
      return {
        ...nodeData,
        title: ast.rawContent,
        icon: React.createElement(Tag),
        color: "error",
      };
  }
};

export const getPossibleChildrenCount = (ast: Ast) => {
  // ignore `maxChildCount` for now, in the future remember to check for Infinity
  // return isAstWithChildren(ast) ? Math.max(ast.children.length, ast.requirements.maxChildCount) : 0;
  return isAstWithChildren(ast) ? ast.children.length : 0;
};

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

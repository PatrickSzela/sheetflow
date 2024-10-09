import { PaletteColors } from "@/libs/mui";
import {
  Ast,
  AstNodeType,
  isAstWithChildren,
  isCellReferenceAst,
  printCellValue,
  Value,
} from "@/libs/sheetflow";
import { SvgIconComponent } from "@mui/icons-material";
import Add from "@mui/icons-material/Add";
import DataArray from "@mui/icons-material/DataArray";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import FormatShapes from "@mui/icons-material/FormatShapes";
import Functions from "@mui/icons-material/Functions";
import PlusOne from "@mui/icons-material/PlusOne";
import SixtyFps from "@mui/icons-material/SixtyFps";
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

export const astToIcon = (ast: Ast): SvgIconComponent => {
  switch (ast.type) {
    case AstNodeType.VALUE:
      return SixtyFps;
    case AstNodeType.REFERENCE:
      return FormatShapes;
    case AstNodeType.FUNCTION:
      return Functions;
    case AstNodeType.UNARY_EXPRESSION:
      return PlusOne;
    case AstNodeType.BINARY_EXPRESSION:
      return Add;
    case AstNodeType.PARENTHESIS:
      return DataArray;
    case AstNodeType.ERROR:
      return ErrorOutline;
  }
};

export const astToColor = (ast: Ast): PaletteColors => {
  switch (ast.type) {
    case AstNodeType.VALUE:
      return "primary";
    case AstNodeType.REFERENCE:
      return "success";
    case AstNodeType.FUNCTION:
      return "info";
    case AstNodeType.UNARY_EXPRESSION:
      return "secondary";
    case AstNodeType.BINARY_EXPRESSION:
      return "secondary";
    case AstNodeType.PARENTHESIS:
      return "warning";
    case AstNodeType.ERROR:
      return "error";
  }
};

export const remapNodeValue = (input: AstNodeValue): NodeValue => ({
  ...input,
  value: printCellValue(input.value),
});

export const mergeInputs = (ast: Ast, inputs?: AstNodeValue[]): NodeValue[] => {
  // ...Array(childCount).fill({ value: null }),

  // if (isAstWithChildren(ast)) {
  //   // const childCount = Math.max(getPossibleChildrenCount(ast), inputs.length);
  //   const childCount = getPossibleChildrenCount(ast);
  // } else if (isAstWithValue(ast)) {
  // }

  let result: NodeValue[] = [];

  // TODO: arrays
  // TODO: other ranges
  if (isCellReferenceAst(ast)) {
    result.push({ value: ast.rawContent });
  }

  if (inputs) {
    result = [...result, ...inputs.map(remapNodeValue)];
  }

  return result;
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
      height: calculateNodeSettingSection(setting),
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

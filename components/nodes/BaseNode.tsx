import { colorizeBoxShadowWithCssVar, PaletteColors } from "@/libs/mui/utils";
import { Box, Divider, styled, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader, {
  cardHeaderClasses,
  CardHeaderProps,
} from "@mui/material/CardHeader";
import { Node, NodeProps, Position } from "@xyflow/react";
import React from "react";
import { MuiHandle } from "./Handle";
import {
  CommonNodeData,
  NodeSettings,
  nodeSettingToCss,
  NodeValue,
} from "./utils";

export type BaseNodeData = CommonNodeData & {
  title: string;
  icon?: React.ReactNode;
  inputs?: NodeValue[];
  output?: NodeValue;
  color?: PaletteColors;
};
export type BaseNode = Node<BaseNodeData, "base">;
export type BaseNodeProps = NodeProps<BaseNode>;

interface NodeRootProps extends Omit<CardHeaderProps, "color"> {
  color?: BaseNodeData["color"];
}

interface NodeHeaderProps extends CardHeaderProps {}

export const NODE_SETTINGS: NodeSettings = {
  header: {
    height: 20,
    spacing: {
      vertical: 4,
      horizontal: 8,
    },
  },
  main: {
    height: 0,
    spacing: {
      vertical: 4,
      horizontal: 0,
    },
  },
  footer: {
    height: 16,
    spacing: {
      vertical: 4,
      horizontal: 0,
    },
  },
  value: {
    height: 24,
    spacing: {
      vertical: 0,
      horizontal: 8,
    },
  },
};

const NodeRoot = styled(Card, {
  shouldForwardProp: (prop) => prop !== "color",
})<NodeRootProps>(({ theme, elevation, variant, color }) => ({
  minWidth: 150,
  overflow: "visible",

  ...(color && {
    "--node-color": (theme.vars || theme).palette[color].main,
    "--node-color-contrast-text": (theme.vars || theme).palette[color]
      .contrastText,

    backgroundColor: "var(--node-color)",

    ...(variant === "outlined" && {
      borderColor: "var(--node-color)",
    }),
  }),
  ...(elevation &&
    color && {
      boxShadow: colorizeBoxShadowWithCssVar(
        theme.shadows[elevation],
        "--node-color"
      ),
    }),
}));

const NodeHeader = styled(CardHeader, {
  shouldForwardProp: (prop) => prop !== "color",
})<NodeHeaderProps>(({ theme, color }) => ({
  ...nodeSettingToCss(NODE_SETTINGS.header),
  backgroundColor: "var(--node-color)",
  color: "var(--node-color-contrast-text)",

  [`& .${cardHeaderClasses.avatar}`]: {
    marginRight: NODE_SETTINGS.header.spacing.vertical,

    [`& svg`]: {
      fontSize: "1.15rem",
    },
  },
}));

const NodeContent = styled(CardContent)(({ theme }) => ({
  backgroundColor: "var(--mui-palette-background-paper)",
  ...nodeSettingToCss(NODE_SETTINGS.main),

  "&:last-child": {
    paddingBottom: NODE_SETTINGS.main.spacing.vertical,
    borderBottomLeftRadius: "inherit",
    borderBottomRightRadius: "inherit",
  },
}));

const NodeListValuePrimitive = styled(Box)(() => ({
  position: "relative",
  ...nodeSettingToCss(NODE_SETTINGS.value),
}));

const NodeDivider = styled(Divider)(() => ({
  borderColor: "var(--node-color)",
  borderBottomWidth: 1,
}));

export const BaseNode = (props: BaseNodeProps) => {
  const {
    data,
    targetPosition,
    sourcePosition,
    isConnectable,
    selected,
    dragging,
  } = props;

  const { highlighted, title, color, icon, inputs, output } = data;
  const elevation = dragging ? 18 : selected ? 16 : highlighted ? 6 : 0;

  return (
    <NodeRoot variant="outlined" color={color} elevation={elevation}>
      <NodeHeader avatar={icon} title={title} />

      {inputs?.length ? (
        <NodeContent>
          {inputs.map(({ value, handleId }, idx) => {
            // TODO: figure out a way to extract names for args
            return (
              <React.Fragment key={idx}>
                <NodeListValuePrimitive>
                  <Typography>{value}</Typography>

                  {handleId ? (
                    <MuiHandle
                      type="target"
                      position={targetPosition ?? Position.Left}
                      id={handleId}
                      isConnectable={isConnectable}
                    />
                  ) : null}
                </NodeListValuePrimitive>
              </React.Fragment>
            );
          })}
        </NodeContent>
      ) : null}

      {inputs?.length && output !== undefined ? <NodeDivider /> : null}

      {output !== undefined ? (
        <NodeContent>
          <NodeListValuePrimitive>
            <Typography textAlign="end">{output.value}</Typography>

            {output.handleId !== undefined ? (
              <MuiHandle
                type="source"
                position={sourcePosition ?? Position.Right}
                isConnectable={isConnectable}
              />
            ) : null}
          </NodeListValuePrimitive>
        </NodeContent>
      ) : null}
    </NodeRoot>
  );
};

import { colorizeBoxShadowWithCssVar, PaletteColors } from "@/libs/mui/utils";
import {
  Box,
  Divider,
  styled,
  Typography,
  typographyClasses,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader, {
  cardHeaderClasses,
  CardHeaderProps,
} from "@mui/material/CardHeader";
import { HandleProps, Node, NodeProps, Position } from "@xyflow/react";
import React from "react";
import { Handle } from "./Handle";
import {
  CommonNodeData,
  NodeSettings,
  nodeSettingToCss,
  NodeValue,
} from "./utils";
import { SetOptional } from "type-fest";

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

  ...(variant === "outlined" && {
    "--node-border-width": "2px",
    borderWidth: "var(--node-border-width)",

    [`& .${cardHeaderClasses.root}`]: {
      paddingTop: `calc(${NODE_SETTINGS.header.spacing.vertical}px - var(--node-border-width))`,
    },
  }),

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
  color: "var(--node-color-contrast-text)",

  [`& .${cardHeaderClasses.avatar}`]: {
    marginRight: NODE_SETTINGS.header.spacing.vertical,

    [`& svg`]: {
      fontSize: "1.15rem",
    },
  },

  [`& .${cardHeaderClasses.content}, & .${cardHeaderClasses.title}`]: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

const NodeContent = styled(CardContent)(({ theme }) => ({
  backgroundColor: "var(--mui-palette-background-paper)",
  ...nodeSettingToCss(NODE_SETTINGS.main),

  "&:last-child": {
    paddingBottom: `${NODE_SETTINGS.main.spacing.vertical}px`,
    borderBottomLeftRadius: "inherit",
    borderBottomRightRadius: "inherit",
  },
}));

const NodeListValuePrimitive = styled(Box)(() => ({
  position: "relative",
  ...nodeSettingToCss(NODE_SETTINGS.value),

  [`& .${typographyClasses.root}`]: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

const NodeDivider = styled(Divider)(() => ({
  borderColor: "var(--node-color)",
  borderBottomWidth: "var(--node-border-width)",
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
      <NodeHeader
        avatar={icon}
        title={title}
        titleTypographyProps={{ title }}
      />

      {inputs?.length ? (
        <NodeContent>
          {inputs.map((input, idx) => {
            // TODO: figure out a way to extract names for args
            return (
              <Value
                key={idx}
                type="input"
                HandleProps={{
                  position: targetPosition ?? Position.Left,
                  isConnectable,
                }}
                {...input}
              />
            );
          })}
        </NodeContent>
      ) : null}

      {inputs?.length && output !== undefined ? <NodeDivider /> : null}

      {output !== undefined ? (
        <NodeContent>
          <Value
            type="output"
            HandleProps={{
              position: sourcePosition ?? Position.Right,
              isConnectable,
            }}
            {...output}
          />
        </NodeContent>
      ) : null}
    </NodeRoot>
  );
};

interface ValueProps extends NodeValue {
  type: "input" | "output";
  HandleProps: SetOptional<HandleProps, "type" | "id">;
}

const Value = (props: ValueProps) => {
  const { value, handleId, type, HandleProps } = props;

  let prefixedValue = `${type === "output" ? "=" : ""}${value}`;

  return (
    <NodeListValuePrimitive title={prefixedValue}>
      <Typography textAlign={type === "input" ? "start" : "end"}>
        {prefixedValue}
      </Typography>

      {handleId !== undefined ? (
        <Handle
          type={type === "input" ? "target" : "source"}
          id={type === "input" ? handleId : undefined}
          {...HandleProps}
        />
      ) : null}
    </NodeListValuePrimitive>
  );
};

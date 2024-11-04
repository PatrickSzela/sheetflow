import { generatePaletteVariants, PaletteColorName } from "@/libs/mui/utils";
import {
  Box,
  Divider,
  styled,
  Typography,
  typographyClasses,
  useTheme,
} from "@mui/material";
import Card, { CardProps } from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader, {
  cardHeaderClasses,
  CardHeaderProps,
} from "@mui/material/CardHeader";
import { useDefaultProps } from "@mui/material/DefaultPropsProvider";
import { HandleProps, Node, NodeProps, Position } from "@xyflow/react";
import React, { useMemo } from "react";
import { SetOptional } from "type-fest";
import { Handle } from "./Handle";
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
  color?: PaletteColorName;
};
export type BaseNode = Node<BaseNodeData, "base">;
export type BaseNodeProps = NodeProps<BaseNode>;

interface NodeRootProps extends Omit<CardProps, "color"> {
  color?: BaseNodeData["color"];
}

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
})<NodeRootProps>(({ theme }) => ({
  "--Node-borderRadius": (theme.vars || theme).shape.borderRadius,

  minWidth: 150,
  overflow: "visible", // allow handle to overflow outside the node
  borderRadius: "var(--Node-borderRadius)",

  variants: [
    ...generatePaletteVariants<NodeRootProps>(theme, (color) => [
      {
        props: {
          color,
        },
        style: {
          "--Node-color": (theme.vars || theme).palette[color].main,
          "--Node-colorContrastText": (theme.vars || theme).palette[color]
            .contrastText,
          "--Node-handleColor": "var(--Node-color)",
        },
      },
      {
        props: {
          color,
          variant: "outlined",
        },
        style: {
          boxShadow: "var(--Node-shadow)",
        },
      },
    ]),
    {
      props: {
        variant: "outlined",
      },
      style: {
        "--Node-borderWidth": "2px",
        "--Node-handleColor": (theme.vars || theme).palette.background.paper,

        border: "none",
        background: "var(--Node-color)",

        "& .NodeContent-root": {
          backgroundColor: (theme.vars || theme).palette.background.paper,
          border: "solid var(--Node-borderWidth, 2px) var(--Node-color)",
          borderRadius: "inherit",
          marginTop:
            "calc(-1 * (var(--Node-borderRadius) + var(--Node-borderWidth)))",
        },

        "& .MuiCardHeader-root": {
          borderLeft: "solid var(--Node-borderWidth, 2px) var(--Node-color)",
          borderRight: "solid var(--Node-borderWidth, 2px) var(--Node-color)",
          borderBottom: "solid var(--Node-borderRadius) var(--Node-color)",
          height: "calc(28px + var(--Node-borderRadius))",
        },
      },
    },
  ],
}));

const NodeHeader = styled(CardHeader)<CardHeaderProps>(() => ({
  ...nodeSettingToCss(NODE_SETTINGS.header),
  color: "var(--Node-colorContrastText)",
  backgroundColor: "var(--Node-color)",
  borderTopLeftRadius: "inherit",
  borderTopRightRadius: "inherit",

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

const NodeSection = styled(CardContent)(() => ({
  ...nodeSettingToCss(NODE_SETTINGS.main),

  "&:last-child": {
    paddingBottom: `${NODE_SETTINGS.main.spacing.vertical}px`,
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
  borderColor: "var(--Node-color)",
  borderBottomWidth: "var(--Node-borderWidth, 2px)",
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

  const { highlighted, title, color = "primary", icon, inputs, output } = data;

  const { variant, elevation: defaultElevation } = useDefaultProps<CardProps>({
    props: { color, variant: "outlined" }, // TODO: move to theme
    name: "MuiCard",
  });

  const theme = useTheme();

  let elevation = defaultElevation ?? (variant === "elevation" ? 1 : 0);
  if (dragging) elevation = 18;
  else if (selected) elevation = 16;
  else if (highlighted) elevation = 6;

  const style = useMemo<NodeRootProps["style"]>(() => {
    if (elevation && variant === "outlined") {
      const shadows = (theme.vars || theme).palette[color].shadows;
      return {
        "--Node-shadow": shadows[elevation],
      } as NodeRootProps["style"];
    }
  }, [color, elevation, theme, variant]);

  return (
    <NodeRoot
      color={color}
      elevation={elevation}
      {...(variant && { variant })}
      {...(style && { style })}
    >
      <NodeHeader
        avatar={icon}
        title={title}
        titleTypographyProps={{ title }}
      />

      {/* TODO: generate classes the proper way */}
      <Box className="NodeContent-root">
        {inputs?.length ? (
          <NodeSection>
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
          </NodeSection>
        ) : null}

        {inputs?.length && output !== undefined ? <NodeDivider /> : null}

        {output !== undefined ? (
          <NodeSection>
            <Value
              type="output"
              HandleProps={{
                position: sourcePosition ?? Position.Right,
                isConnectable,
              }}
              {...output}
            />
          </NodeSection>
        ) : null}
      </Box>
    </NodeRoot>
  );
};

interface ValueProps extends NodeValue {
  type: "input" | "output";
  HandleProps: SetOptional<HandleProps, "type" | "id">;
}

const Value = (props: ValueProps) => {
  const { value, handleId, type, HandleProps } = props;

  const prefixedValue = `${type === "output" ? "=" : ""}${value}`;

  return (
    <NodeListValuePrimitive title={prefixedValue}>
      <Typography textAlign={type === "input" ? "start" : "end"}>
        {prefixedValue}
      </Typography>

      {handleId !== undefined ? (
        <Handle
          type={type === "input" ? "target" : "source"}
          {...(type === "input" && { id: handleId })}
          {...HandleProps}
        />
      ) : null}
    </NodeListValuePrimitive>
  );
};

import { AstNodeProps } from "@/components/nodes/AstNode";
import {
  getPossibleChildrenCount,
  NodeSettings,
  nodeSettingToCss,
} from "@/components/nodes/utils";
import { printCellValue } from "@/libs/sheetflow";
import { Handle, Position } from "@xyflow/react";
import React from "react";

// TODO: remove

const NODE_SETTINGS: NodeSettings = {
  header: {
    height: 23,
    spacing: {
      vertical: 0,
      horizontal: 0,
    },
  },
  main: {
    height: 0,
    spacing: {
      horizontal: 0,
      vertical: 0,
    },
  },
  footer: {
    height: 23,
    spacing: {
      vertical: 0,
      horizontal: 0,
    },
  },
  value: {
    height: 22,
    spacing: {
      vertical: 0,
      horizontal: 0,
    },
  },
};

// TODO: hella ugly

export const AstNode = (props: AstNodeProps) => {
  const { data, targetPosition, sourcePosition, isConnectable, selected } =
    props;
  const { ast, inputs, output, highlighted } = data;

  const childCount = getPossibleChildrenCount(ast);

  return (
    <div
      style={{
        background: "white",
        color: "black",
        minWidth: 150,
        border: "1px solid red",
        boxShadow: `0 0 15px rgba(255,0,0,${
          selected ? 1 : highlighted ? 0.5 : 0
        })`,
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid red",
          ...nodeSettingToCss(NODE_SETTINGS.header),
        }}
      >
        {ast.type}
      </header>

      <main>
        {Array(childCount)
          .fill(0)
          .map((_, idx) => {
            // TODO: figure out a way to extract names for args
            const childId = `${idx}`;

            return (
              <React.Fragment key={childId}>
                <div
                  style={{
                    position: "relative",
                    ...nodeSettingToCss(NODE_SETTINGS.value),
                  }}
                >
                  {inputs ? printCellValue(inputs[idx].value) : ""}

                  {inputs?.[idx].handleId !== undefined ? (
                    <Handle
                      type="target"
                      position={targetPosition ?? Position.Left}
                      id={inputs[idx].handleId}
                      isConnectable={isConnectable}
                    />
                  ) : null}
                </div>
              </React.Fragment>
            );
          })}
      </main>

      <footer
        style={{
          textAlign: "right",
          borderTop: "1px solid red",
          position: "relative",
          ...nodeSettingToCss(NODE_SETTINGS.footer),
        }}
      >
        {output ? printCellValue(output.value) : ""}

        {output?.handleId !== null ? (
          <Handle
            type="source"
            position={sourcePosition ?? Position.Right}
            isConnectable={isConnectable}
          />
        ) : null}
      </footer>
    </div>
  );
};

AstNode.settings = NODE_SETTINGS;

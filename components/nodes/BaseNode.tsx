import {
  Ast,
  isAstWithChildren,
  printCellValue,
  Value,
} from "@/libs/sheetflow";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React from "react";

export type BaseNodeProps = Node<
  {
    ast: Ast;
    value?: Value;
    childrenValues?: Value[];
    hasOutput?: boolean;
    highlighted?: boolean;
  },
  "baseNode"
>;

const HEADER_HEIGHT = 23;
const ARG_HEIGHT = 22;
const FOOTER_HEIGHT = 23;

export const getPossibleChildrenCount = (ast: Ast) =>
  isAstWithChildren(ast)
    ? Math.max(ast.children.length, ast.requirements.maxChildCount)
    : 0;

export const calculateNodeSize = (ast: Ast) => {
  return {
    height:
      HEADER_HEIGHT +
      getPossibleChildrenCount(ast) * ARG_HEIGHT +
      ARG_HEIGHT +
      FOOTER_HEIGHT,
    width: 150,
  };
};

// TODO: hella ugly

export const BaseNode = (props: NodeProps<BaseNodeProps>) => {
  const { data, targetPosition, sourcePosition, isConnectable, selected } =
    props;
  const {
    ast,
    value,
    childrenValues,
    hasOutput = true,
    highlighted = false,
  } = data;

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
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{ borderBottom: "1px solid red", height: HEADER_HEIGHT - 1 }}
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
                <div style={{ height: ARG_HEIGHT, padding: "0 3px" }}>
                  {childrenValues ? printCellValue(childrenValues[idx]) : ""}
                </div>

                <Handle
                  type="target"
                  position={targetPosition ?? Position.Left}
                  id={childId}
                  isConnectable={isConnectable}
                  style={{
                    top: HEADER_HEIGHT + ARG_HEIGHT * idx + ARG_HEIGHT / 2,
                  }}
                />
              </React.Fragment>
            );
          })}

        <div
          style={{
            height: ARG_HEIGHT,
            textAlign: "right",
            borderTop: "solid 1px red",
            padding: "0 3px",
          }}
        >
          {value ? printCellValue(value) : ""}
        </div>

        {hasOutput ? (
          <Handle
            type="source"
            position={sourcePosition ?? Position.Right}
            isConnectable={isConnectable}
            style={{
              top: HEADER_HEIGHT + ARG_HEIGHT * childCount + ARG_HEIGHT / 2,
            }}
          />
        ) : null}
      </main>

      <footer style={{ borderTop: "1px solid red", height: FOOTER_HEIGHT - 1 }}>
        <small style={{ textWrap: "nowrap" }}>{ast.rawContent}</small>
      </footer>
    </div>
  );
};

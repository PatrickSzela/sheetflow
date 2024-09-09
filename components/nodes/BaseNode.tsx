import { Ast, printCellValue, Value } from "@/libs/sheetflow";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React from "react";

export type BaseNode = Node<
  {
    ast: Ast;
    values: Value[];
    hasOutput?: boolean;
    highlighted?: boolean;
  },
  "baseNode"
>;

const HEADER_HEIGHT = 23;
const ARG_HEIGHT = 22;
const FOOTER_HEIGHT = 23;

export const calculateNodeSize = (ast: Ast) => {
  return {
    height:
      HEADER_HEIGHT +
      ("requirements" in ast ? ast.requirements.maxChildCount : 0) *
        ARG_HEIGHT +
      FOOTER_HEIGHT,
    width: 150,
  };
};

// TODO: hella ugly

export const BaseNode = (props: NodeProps<BaseNode>) => {
  const { data, targetPosition, sourcePosition, isConnectable, selected } =
    props;
  const { ast, values, hasOutput = true, highlighted = false } = data;

  return (
    <div
      style={{
        background: "white",
        minWidth: 150,
        border: "1px solid red",
        boxShadow: `0 0 15px rgba(255,0,0,${selected ? 1 : highlighted ? 0.5 : 0})`,
        overflow: "hidden",
      }}
    >
      <header
        style={{ borderBottom: "1px solid red", height: HEADER_HEIGHT - 1 }}
      >
        {ast.type}
      </header>

      {"requirements" in ast
        ? Array(ast.requirements.maxChildCount)
            .fill(0)
            .map((_, idx) => {
              // TODO: figure out a way to extract names for args
              const childId = `${idx}`;

              return (
                <React.Fragment key={childId}>
                  <div style={{ height: ARG_HEIGHT }}>
                    {printCellValue(values[idx])}
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
            })
        : null}

      {hasOutput ? (
        <Handle
          type="source"
          position={sourcePosition ?? Position.Right}
          isConnectable={isConnectable}
        />
      ) : null}

      <footer style={{ borderTop: "1px solid red", height: FOOTER_HEIGHT - 1 }}>
        <small style={{ textWrap: "nowrap" }}>{ast.rawContent}</small>
      </footer>
    </div>
  );
};

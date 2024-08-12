import { Ast } from "@/libs/sheetflow";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React from "react";

export type BaseNode = Node<{ ast: Ast }, "baseNode">;

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
  const { data, targetPosition, sourcePosition } = props;
  const { ast } = data;

  return (
    <div
      style={{
        background: "white",
        minWidth: 150,
        border: "1px solid red",
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
              const childId = ast.children[idx].id;

              return (
                <React.Fragment key={childId}>
                  <div style={{ height: ARG_HEIGHT }}>arg {idx}</div>

                  <Handle
                    type="target"
                    position={targetPosition ?? Position.Left}
                    id={childId}
                    style={{
                      top: HEADER_HEIGHT + ARG_HEIGHT * idx + ARG_HEIGHT / 2,
                    }}
                  />
                </React.Fragment>
              );
            })
        : null}

      <footer style={{ borderTop: "1px solid red", height: FOOTER_HEIGHT - 1 }}>
        <small style={{ textWrap: "nowrap" }}>{ast.rawContent}</small>
      </footer>

      <Handle type="source" position={sourcePosition ?? Position.Right} />
    </div>
  );
};

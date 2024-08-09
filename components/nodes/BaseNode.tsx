import { Ast } from "@/libs/sheetflow";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React from "react";

export type BaseNode = Node<{ ast: Ast }, "baseNode">;

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
      <header style={{ borderBottom: "1px solid red" }}>{ast.type}</header>

      {"requirements" in ast
        ? Array(ast.requirements.maxChildCount)
            .fill(0)
            .map((_, idx) => {
              const childId = ast.children[idx].id;

              return (
                <React.Fragment key={childId}>
                  <div>arg {idx}</div>

                  <Handle
                    type="target"
                    position={targetPosition ?? Position.Left}
                    id={childId}
                    style={{ top: 23 + 22 * idx + 22 / 2 }}
                  />
                </React.Fragment>
              );
            })
        : null}

      <footer style={{ borderTop: "1px solid red" }}>
        <small style={{ textWrap: "nowrap" }}>{ast.rawContent}</small>
      </footer>

      <Handle type="source" position={sourcePosition ?? Position.Right} />
    </div>
  );
};

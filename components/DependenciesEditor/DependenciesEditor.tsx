import { CellContent, GroupedCells, NamedExpressions } from "@/libs/sheetflow";
import React from "react";

export interface DependenciesEditorProps {
  cells?: GroupedCells;
  namedExpressions?: NamedExpressions;
  onCellChange?: (address: string, value: CellContent) => void;
  onNamedExpressionChange?: (name: string, value: CellContent) => void;
}

// TODO: simplify

export const DependenciesEditor = (props: DependenciesEditorProps) => {
  const {
    cells = {},
    namedExpressions = [],
    onCellChange,
    onNamedExpressionChange,
  } = props;

  return (
    <div>
      {Object.entries(cells).map(([sheet, cells]) => {
        return (
          <React.Fragment key={sheet}>
            <span>{sheet}:</span>

            {cells.map(({ stringAddress, address, content }) => {
              const [colRow] = stringAddress.split("!").reverse();

              return (
                <div key={stringAddress} style={{ display: "flex" }}>
                  <label htmlFor={stringAddress}>{colRow}:</label>

                  <input
                    id={stringAddress}
                    defaultValue={
                      typeof content === "number" || typeof content === "string"
                        ? content
                        : undefined
                    }
                    onChange={(e) => {
                      const v = e.currentTarget.value;
                      let newVal: CellContent;

                      if (v === "") {
                        newVal = null;
                      } else if (!Number.isNaN(Number(v))) {
                        newVal = Number(v);
                      } else {
                        newVal = v;
                      }

                      onCellChange?.(stringAddress, newVal);
                    }}
                  />
                </div>
              );
            })}

            <hr />
          </React.Fragment>
        );
      })}

      {namedExpressions.length ? <span>Named expressions:</span> : null}
      {namedExpressions.map(({ name, expression, scope }, idx) => {
        const key = `${name}_${scope}_${idx}`;

        return (
          <div key={key} style={{ display: "flex" }}>
            <label htmlFor={key}>{name}:</label>

            <input
              id={key}
              defaultValue={
                typeof expression === "number" || typeof expression === "string"
                  ? expression
                  : undefined
              }
              onChange={(e) => {
                const v = e.currentTarget.value;
                let newVal: CellContent;

                if (v === "") {
                  newVal = null;
                } else if (!Number.isNaN(Number(v))) {
                  newVal = Number(v);
                } else {
                  newVal = v;
                }

                onNamedExpressionChange?.(name, newVal);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

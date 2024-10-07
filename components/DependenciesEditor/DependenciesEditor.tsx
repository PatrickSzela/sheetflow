import {
  CellContent,
  GroupedCells,
  NamedExpressions,
  extractDataFromStringAddress,
} from "@/libs/sheetflow";
import React, { useRef, useState } from "react";

export interface DependenciesEditorProps {
  cells?: GroupedCells;
  namedExpressions?: NamedExpressions;
  missingSheets?: string[];
  missingNamedExpressions?: string[];
  onCellChange?: (address: string, value: CellContent) => void;
  onNamedExpressionChange?: (name: string, value: CellContent) => void;
  onSheetAdd?: (name: string) => void;
  onNamedExpressionAdd?: (name: string) => void;
}

// TODO: simplify

export const DependenciesEditor = (props: DependenciesEditorProps) => {
  const {
    cells = {},
    namedExpressions = [],
    missingSheets,
    missingNamedExpressions,
    onCellChange,
    onNamedExpressionChange,
    onSheetAdd,
    onNamedExpressionAdd,
  } = props;

  const addSheetInput = useRef<HTMLInputElement>(null);
  const addNamedExpressionInput = useRef<HTMLInputElement>(null);
  const addMissingSheetSelect = useRef<HTMLSelectElement>(null);
  const addMissingNamedExpressionSelect = useRef<HTMLSelectElement>(null);
  const [addSheet, setAddSheet] = useState("");
  const [addNamedExpression, setAddNamedExpression] = useState("");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        {Object.entries(cells).map(([sheet, cells]) => {
          return (
            <React.Fragment key={sheet}>
              <span>{sheet}:</span>

              {cells.map(({ stringAddress, address, content }) => {
                const { position } =
                  extractDataFromStringAddress(stringAddress);

                return (
                  <div key={stringAddress} style={{ display: "flex" }}>
                    <label htmlFor={stringAddress}>{position}:</label>

                    <input
                      id={stringAddress}
                      defaultValue={
                        typeof content === "number" ||
                        typeof content === "string"
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
                  typeof expression === "number" ||
                  typeof expression === "string"
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

      <div>
        {missingSheets?.length && onSheetAdd ? (
          <div>
            <label htmlFor="addMissingSheet">Add missing sheet:</label>

            <select ref={addMissingSheetSelect}>
              {missingSheets.map((sheet) => (
                <option id="addMissingSheet" key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const value = addMissingSheetSelect.current?.value;
                if (value) onSheetAdd(value);
              }}
            >
              Add
            </button>
          </div>
        ) : null}
      </div>

      <div>
        {missingNamedExpressions?.length && onNamedExpressionAdd ? (
          <div>
            <label htmlFor="addMissingNamedExpression">
              Add missing named expression:
            </label>

            <select ref={addMissingNamedExpressionSelect}>
              {missingNamedExpressions.map((namedExpression) => (
                <option
                  id="addMissingNamedExpression"
                  key={namedExpression}
                  value={namedExpression}
                >
                  {namedExpression}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const value = addMissingNamedExpressionSelect.current?.value;
                if (value) onNamedExpressionAdd(value);
              }}
            >
              Add
            </button>
          </div>
        ) : null}
      </div>

      <div>
        {onSheetAdd ? (
          <div>
            <input
              ref={addSheetInput}
              onChange={(e) => setAddSheet(e.currentTarget.value)}
              placeholder="Add sheet"
            />
            <button
              onClick={() => {
                if (addSheetInput.current) {
                  onSheetAdd(addSheet);
                  addSheetInput.current.value = "";
                  setAddSheet("");
                }
              }}
            >
              Add
            </button>
          </div>
        ) : null}

        {onNamedExpressionAdd ? (
          <div>
            <input
              ref={addNamedExpressionInput}
              onChange={(e) => setAddNamedExpression(e.currentTarget.value)}
              placeholder="Add named expression"
            />
            <button
              onClick={() => {
                if (addNamedExpressionInput.current) {
                  onNamedExpressionAdd(addNamedExpression);
                  addNamedExpressionInput.current.value = "";
                  setAddNamedExpression("");
                }
              }}
            >
              Add
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

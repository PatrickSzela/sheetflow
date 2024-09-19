import { CellContent, CellList, NamedExpressions } from "@/libs/sheetflow";

export interface DependenciesEditorProps {
  cells?: CellList;
  namedExpressions?: NamedExpressions;
  onCellChange?: (address: string, value: CellContent) => void;
  onNamedExpressionChange?: (name: string, value: CellContent) => void;
}

// TODO: simplify
// TODO: group cells by sheet

export const DependenciesEditor = (props: DependenciesEditorProps) => {
  const {
    cells = [],
    namedExpressions = [],
    onCellChange,
    onNamedExpressionChange,
  } = props;

  return (
    <div>
      {Object.entries(cells).map(([address, cell]) => {
        const key = `${address}`;

        return (
          <div key={key} style={{ display: "flex" }}>
            <label htmlFor={key}>{address}:</label>

            <input
              id={key}
              defaultValue={
                typeof cell === "number" || typeof cell === "string"
                  ? cell
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

                onCellChange?.(address, newVal);
              }}
            />
          </div>
        );
      })}

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

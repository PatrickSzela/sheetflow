import {
  buildCellAddressFromString,
  Cell,
  CellAddress,
  CellList,
} from "@/libs/sheetflow";

export interface DependenciesEditorProps {
  cells: CellList;
  onChange?: (address: CellAddress, value: Cell) => void;
}

// TODO: group cells by sheet

export const DependenciesEditor = (props: DependenciesEditorProps) => {
  const { cells, onChange } = props;

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
                let newVal: Cell;

                if (v === "") {
                  newVal = null;
                } else if (!Number.isNaN(v)) {
                  newVal = Number(v);
                } else {
                  newVal = v;
                }

                onChange?.(buildCellAddressFromString(address), newVal);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

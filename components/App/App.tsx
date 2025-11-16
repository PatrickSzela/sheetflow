import { useMemo, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaEditor } from "@/components/FormulaEditor";
import { Main } from "@/components/Main";
import { HyperFormulaEngine } from "@/libs/hyperformula";
import {
  SheetFlowProvider,
  findMostSimilarLanguage,
  groupReferencesBySheet,
  useCreatePlacedAst,
  usePlacedAst,
  usePlacedAstData,
  useSheetFlow,
  type SheetFlowConfig,
  type Sheets,
} from "@/libs/sheetflow";

import "@xyflow/react/dist/style.css";

const sheets: Sheets = {
  Sheet1: [],
};

// TODO: temporary solution, remove once layout manager is implemented
const f = Array.from({ length: 27 }).fill(null);
sheets["Sheet1"] = Array.from({ length: 100 }).fill([]) as Sheets[string];
sheets["Sheet1"][0] = ["1"];
sheets["Sheet1"][1] = ["2"];
sheets["Sheet1"][2] = ["3"];
sheets["Sheet1"][99] = Array.from({ length: 100 });
sheets["Sheet1"][99][26] = "=A1*A2+A3";

export const App = () => {
  const options = useMemo<Partial<SheetFlowConfig>>(() => {
    return {
      language: findMostSimilarLanguage(
        [...navigator.languages],
        HyperFormulaEngine.getAllLanguages(),
      ),
    };
  }, []);

  return (
    <SheetFlowProvider
      engine={HyperFormulaEngine}
      sheets={sheets}
      config={options}
    >
      <AppInner />
    </SheetFlowProvider>
  );
};

const DependenciesEditorPlacedAst = (props: { id: string }) => {
  const { id } = props;

  const sf = useSheetFlow();

  const { placedAst } = usePlacedAst(id);
  const { precedents } = usePlacedAstData(placedAst);

  const { cells, namedExpressions } = useMemo(() => {
    return groupReferencesBySheet(sf, precedents ?? []);
  }, [sf, precedents]);

  return (
    <DependenciesEditor cells={cells} namedExpressions={namedExpressions} />
  );
};

const AppInner = () => {
  const sf = useSheetFlow();
  const [selectedEditor, setSelectedEditor] = useState<string>();

  const { placedAst } = useCreatePlacedAst(
    sf.stringToCellAddress("Sheet1!AA100"),
  );

  const drawerChildren =
    selectedEditor && sf.isAstPlaced(selectedEditor) ? (
      <DependenciesEditorPlacedAst id={selectedEditor} />
    ) : null;

  return (
    <Main
      position="relative"
      display="flex"
      width="100%"
      height="100%"
      slotProps={{
        drawer: {
          anchor: "right",
          children: drawerChildren,
        },
      }}
    >
      <ReactFlowProvider>
        <FormulaEditor placedAst={placedAst} onFocus={setSelectedEditor} />
      </ReactFlowProvider>
    </Main>
  );
};

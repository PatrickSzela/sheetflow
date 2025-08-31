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

export const App = () => {
  const options: SheetFlowConfig = useMemo(() => {
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

const DependenciesEditorPlacedAst = (props: { uuid: string }) => {
  const { uuid } = props;

  const sf = useSheetFlow();

  const { placedAst } = usePlacedAst(uuid);
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

  const drawerChildren =
    selectedEditor && sf.isAstPlaced(selectedEditor) ? (
      <DependenciesEditorPlacedAst uuid={selectedEditor} />
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
        <FormulaEditor
          defaultScope={sf.getSheetIdWithError("Sheet1")}
          onFocus={setSelectedEditor}
          defaultFormula="=A1+A2*A3"
        />
      </ReactFlowProvider>
    </Main>
  );
};

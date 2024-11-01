import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaEditor } from "@/components/FormulaEditor";
import { Main } from "@/components/Main";
import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import {
  groupReferencesBySheet,
  PlacedAst,
  SheetFlowProvider,
  Sheets,
  usePlacedAst,
  usePlacedAstData,
  useSheetFlow,
} from "@/libs/sheetflow";
import { useMemo, useState } from "react";

const options: HyperFormulaConfig = {
  licenseKey: "gpl-v3",
  language: "enUS",
};

const sheets: Sheets = {
  Sheet1: [],
};

export const App = () => {
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
      <FormulaEditor
        scope="Sheet1"
        onFocus={setSelectedEditor}
        defaultFormula="=A1+A2*A3"
      />
    </Main>
  );
};

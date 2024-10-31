import { DependenciesEditor } from "@/components/DependenciesEditor";
import { FormulaEditor } from "@/components/FormulaEditor";
import { Main } from "@/components/Main";
import { HyperFormulaConfig, HyperFormulaEngine } from "@/libs/hyperformula";
import {
  groupReferencesBySheet,
  SheetFlowProvider,
  Sheets,
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

const AppInner = () => {
  const sf = useSheetFlow();

  const [selectedEditor, setSelectedEditor] = useState<string>();
  const { precedents } = usePlacedAstData(selectedEditor);

  const { cells, namedExpressions } = useMemo(() => {
    return groupReferencesBySheet(sf, precedents ?? []);
  }, [sf, precedents]);

  const drawerChildren = (
    <DependenciesEditor cells={cells} namedExpressions={namedExpressions} />
  );

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

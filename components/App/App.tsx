import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { ReactFlowProvider } from "@xyflow/react";
import {
  DockviewApi,
  DockviewReact,
  type DockviewGroupPanel,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
} from "dockview";
import { DependenciesEditor } from "@/components/DependenciesEditor";
import {
  FormulaEditor,
  type FormulaEditorProps,
} from "@/components/FormulaEditor";
import { Main } from "@/components/Main";
import { OpenCell } from "@/components/OpenCell";
import { HyperFormulaEngine } from "@/libs/hyperformula";
import {
  SheetFlowProvider,
  findMostSimilarLanguage,
  groupReferencesBySheet,
  isCellAddress,
  usePlacedAst,
  usePlacedAstData,
  useSheetFlow,
  type PlacedAstSource,
  type SheetFlowConfig,
  type SheetFlowEngine,
  type Sheets,
} from "@/libs/sheetflow";

import "@xyflow/react/dist/style.css";
import "dockview/dist/styles/dockview.css";

const sheets: Sheets = {
  Sheet1: [],
};

const Default = (props: IDockviewPanelProps<FormulaEditorProps>) => {
  const { placedAst } = props.params;

  return (
    <ReactFlowProvider>
      <FormulaEditor placedAst={placedAst} />
    </ReactFlowProvider>
  );
};

const components = {
  default: Default,
};

const createPanel = (
  dockview: DockviewApi,
  sf: SheetFlowEngine,
  reference: PlacedAstSource,
  onFocus: (id: string) => void,
  groupPanel?: DockviewGroupPanel,
) => {
  // TODO: implement named expressions
  if (!isCellAddress(reference))
    throw new Error("Named Expressions not implemented");

  const placedAst = sf.createPlacedAst(reference);

  const panel = dockview.addPanel<FormulaEditorProps>({
    id: placedAst.id,
    title: sf.cellAddressToString(reference),
    component: "default",
    ...(groupPanel && {
      position: {
        referenceGroup: groupPanel,
      },
    }),
    params: {
      placedAst,
    },
  });

  if (panel.api.isActive) onFocus(placedAst.id);

  panel.api.onDidActiveChange((e) => {
    if (e.isActive) onFocus(placedAst.id);
  });
};

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
  const [openCellOpen, setOpenCellOpen] = useState<{
    open: boolean;
    closeable: boolean;
    panel?: DockviewGroupPanel;
  }>({ open: false, closeable: true, panel: undefined });
  const [dockview, setDockview] = useState<DockviewApi>();

  const drawerChildren =
    selectedEditor && sf.isAstPlaced(selectedEditor) ? (
      <DependenciesEditorPlacedAst id={selectedEditor} />
    ) : null;

  const onReady = (e: DockviewReadyEvent) => {
    e.api.onDidRemovePanel((e) => {
      sf.removePlacedAst(e.id);
    });

    setDockview(e.api);
    setOpenCellOpen({ open: true, closeable: false, panel: undefined });
  };

  return (
    <Main
      position="relative"
      width="100%"
      height="100%"
      slotProps={{
        drawer: {
          anchor: "right",
          children: drawerChildren,
        },
      }}
    >
      <DockviewReact
        className={"dockview-theme-abyss"}
        onReady={onReady}
        components={components}
        leftHeaderActionsComponent={(e) => (
          <Stack marginLeft={0.5} gap={0.5}>
            <IconButton
              size="small"
              onClick={() =>
                setOpenCellOpen({ open: true, closeable: true, panel: e.group })
              }
            >
              <AddIcon />
            </IconButton>
          </Stack>
        )}
      />

      <OpenCell
        open={openCellOpen.open}
        closeable={openCellOpen.closeable}
        onSubmit={(r) => {
          createPanel(dockview!, sf, r, setSelectedEditor, openCellOpen.panel);
          setOpenCellOpen({ open: false, closeable: true, panel: undefined });
        }}
        onClose={() => {
          if (!openCellOpen.closeable) return;
          setOpenCellOpen({ open: false, closeable: true, panel: undefined });
        }}
      />
    </Main>
  );
};

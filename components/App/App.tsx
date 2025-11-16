import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { ReactFlowProvider } from "@xyflow/react";
import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewHeaderActionsProps,
  type IDockviewPanelProps,
  type IWatermarkPanelProps,
} from "dockview";
import { DependenciesEditor } from "@/components/DependenciesEditor";
import {
  FormulaEditor,
  type FormulaEditorProps,
} from "@/components/FormulaEditor";
import { Main } from "@/components/Main";
import { HyperFormulaEngine } from "@/libs/hyperformula";
import {
  SheetFlowProvider,
  buildCellAddress,
  findMostSimilarLanguage,
  groupReferencesBySheet,
  usePlacedAst,
  usePlacedAstData,
  useSheetFlow,
  type CellAddress,
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
  address: CellAddress,
  onFocus: (id: string) => void,
  headerActions?: IDockviewHeaderActionsProps,
) => {
  const placedAst = sf.createPlacedAst(address);

  const panel = dockview.addPanel<FormulaEditorProps>({
    id: placedAst.id,
    title: sf.cellAddressToString(address),
    component: "default",
    ...(headerActions && {
      position: {
        referenceGroup: headerActions.group,
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

const Watermark = (
  props: IWatermarkPanelProps & { onFocus: (id: string) => void },
) => {
  const { containerApi, onFocus } = props;
  const sf = useSheetFlow();

  return (
    <div
      onClick={() =>
        createPanel(
          containerApi,
          sf,
          buildCellAddress(0, 0, sf.getSheetIdWithError("Sheet1")),
          onFocus,
        )
      }
    >
      Create new tab
    </div>
  );
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

  const drawerChildren =
    selectedEditor && sf.isAstPlaced(selectedEditor) ? (
      <DependenciesEditorPlacedAst id={selectedEditor} />
    ) : null;

  const onReady = (e: DockviewReadyEvent) => {
    e.api.onDidRemovePanel((e) => {
      sf.removePlacedAst(e.id);
    });
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
        watermarkComponent={(p) => (
          <Watermark {...p} onFocus={setSelectedEditor} />
        )}
        leftHeaderActionsComponent={(e) => (
          <Stack marginLeft={0.5} gap={0.5}>
            <IconButton
              size="small"
              onClick={() =>
                createPanel(
                  e.containerApi,
                  sf,
                  buildCellAddress(0, 0, sf.getSheetIdWithError("Sheet1")),
                  setSelectedEditor,
                  e,
                )
              }
            >
              <AddIcon />
            </IconButton>
          </Stack>
        )}
      />
    </Main>
  );
};

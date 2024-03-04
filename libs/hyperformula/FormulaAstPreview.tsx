import { ObjectInspector } from "react-inspector";
import { useFormulaAst } from "./useFormulaAst";

interface FormulaAstPreviewProps {
  formula?: string;
}

export const FormulaAstPreview = (props: FormulaAstPreviewProps) => {
  const { formula = "" } = props;

  const data = useFormulaAst(formula);

  return <ObjectInspector expandLevel={10} data={data} />;
};

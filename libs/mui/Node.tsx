import { BaseNodeProps } from "@/components/nodes";
import { Ast, AstNodeType } from "@/libs/sheetflow";
import { SvgIconComponent } from "@mui/icons-material";
import Add from "@mui/icons-material/Add";
import DataArray from "@mui/icons-material/DataArray";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import FormatShapes from "@mui/icons-material/FormatShapes";
import Functions from "@mui/icons-material/Functions";
import PlusOne from "@mui/icons-material/PlusOne";
import SixtyFps from "@mui/icons-material/SixtyFps";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

export interface NodeProps extends BaseNodeProps {}

const astToIcon = (ast: Ast): SvgIconComponent => {
  switch (ast.type) {
    case AstNodeType.VALUE:
      return SixtyFps;
    case AstNodeType.REFERENCE:
      return FormatShapes;
    case AstNodeType.FUNCTION:
      return Functions;
    case AstNodeType.UNARY_EXPRESSION:
      return PlusOne;
    case AstNodeType.BINARY_EXPRESSION:
      return Add;
    case AstNodeType.PARENTHESIS:
      return DataArray;
    case AstNodeType.ERROR:
      return ErrorOutline;
  }
};

export const Node = (props: NodeProps) => {
  const { data } = props;
  const { ast } = data;

  const Icon = astToIcon(ast);

  return (
    <Card>
      <CardHeader avatar={<Icon />} title={ast.type} />
      <CardContent>{ast.type}</CardContent>
    </Card>
  );
};

import { CellAddress, isCellAddress } from "../cellAddress";
import {
  AstNodeSubtype,
  AstNodeType,
  AstWithSubtype,
  BuildFn,
  isAst,
} from "./ast";

export interface CellReferenceAst
  extends AstWithSubtype<AstNodeType.REFERENCE, AstNodeSubtype.CELL> {
  reference: CellAddress;
}
export const buildCellReferenceAst: BuildFn<CellReferenceAst> = ({
  id,
  ...args
}) => ({
  type: AstNodeType.REFERENCE,
  subtype: AstNodeSubtype.CELL,
  id: id ?? crypto.randomUUID(),
  ...args,
});
export const isCellReferenceAst = (ast: any): ast is CellReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, reference } = ast as CellReferenceAst;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.CELL &&
    isCellAddress(reference)
  );
};

import { CellAddress, isCellAddress } from "../cellAddress";
import {
  AstNodeSubtype,
  AstNodeType,
  AstWithSubtype,
  buildAst,
  BuildFn,
  isAst,
} from "./ast";

export interface CellReferenceAst
  extends AstWithSubtype<AstNodeType.REFERENCE, AstNodeSubtype.CELL> {
  reference: CellAddress;
}

export const buildCellReferenceAst: BuildFn<CellReferenceAst> = (args) =>
  buildAst({
    type: AstNodeType.REFERENCE,
    subtype: AstNodeSubtype.CELL,
    ...args,
  });

export const isCellReferenceAst = (ast: any): ast is CellReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, reference } = ast as Partial<CellReferenceAst>;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.CELL &&
    isCellAddress(reference)
  );
};

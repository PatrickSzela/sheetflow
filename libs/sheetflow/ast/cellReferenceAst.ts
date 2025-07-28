import { isCellAddress, type CellAddress } from "../cellAddress";
import {
  AstNodeSubtype,
  AstNodeType,
  buildAst,
  isAst,
  type AstWithSubtype,
  type BuildFn,
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

export const isCellReferenceAst = (ast: unknown): ast is CellReferenceAst => {
  if (!isAst(ast)) return false;

  const { type, subtype, reference } = ast as Partial<CellReferenceAst>;

  return (
    type === AstNodeType.REFERENCE &&
    subtype === AstNodeSubtype.CELL &&
    isCellAddress(reference)
  );
};

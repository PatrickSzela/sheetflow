import {
  AstNodeSubtype,
  AstNodeType,
  AstWithValue,
  BuildFn,
  isAstWithValue,
} from "./ast";

export interface EmptyAst extends AstWithValue<AstNodeSubtype.EMPTY, null> {}

export const buildEmptyAst: BuildFn<EmptyAst> = ({ id, ...args }) => ({
  type: AstNodeType.VALUE,
  subtype: AstNodeSubtype.EMPTY,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isEmptyAst = (ast: any): ast is EmptyAst => {
  const { subtype, value } = ast as EmptyAst;

  return (
    isAstWithValue(ast) && subtype === AstNodeSubtype.EMPTY && value === null
  );
};

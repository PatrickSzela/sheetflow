import { AstBase, AstNodeType, buildAst, BuildFn, isAst } from "./ast";

export interface ErrorAst extends AstBase<AstNodeType.ERROR> {
  error: string;
}

export const buildErrorAst: BuildFn<ErrorAst> = (args) =>
  buildAst({
    type: AstNodeType.ERROR,
    ...args,
  });

export const isErrorAst = (ast: any): ast is ErrorAst => {
  if (!isAst(ast)) return false;

  const { type, error } = ast as Partial<ErrorAst>;

  return type === AstNodeType.ERROR && typeof error === "string";
};

import { AstBase, AstNodeType, BuildFn, isAst } from "./ast";

export interface ErrorAst extends AstBase<AstNodeType.ERROR> {
  error: string;
}

export const buildErrorAst: BuildFn<ErrorAst> = ({ id, ...args }) => ({
  type: AstNodeType.ERROR,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isErrorAst = (ast: any): ast is ErrorAst => {
  const { type, error } = ast as ErrorAst;
  return isAst(ast) && type === AstNodeType.ERROR && typeof error === "string";
};

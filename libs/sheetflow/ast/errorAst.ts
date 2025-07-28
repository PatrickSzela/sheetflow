import {
  AstNodeType,
  buildAst,
  isAst,
  type AstBase,
  type BuildFn,
} from "./ast";

// TODO: add types for errors, based on `ErrorType` from hyperformula

export interface ErrorAst extends AstBase<AstNodeType.ERROR> {
  error: string;
}

export const buildErrorAst: BuildFn<ErrorAst> = (args) =>
  buildAst({
    type: AstNodeType.ERROR,
    ...args,
  });

export const isErrorAst = (ast: unknown): ast is ErrorAst => {
  if (!isAst(ast)) return false;

  const { type, error } = ast as Partial<ErrorAst>;

  return type === AstNodeType.ERROR && typeof error === "string";
};

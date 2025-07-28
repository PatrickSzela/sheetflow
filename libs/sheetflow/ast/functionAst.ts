import {
  AstNodeType,
  buildAst,
  isAstWithChildren,
  type Ast,
  type AstWithChildren,
  type BuildFn,
} from "./ast";

export interface FunctionAst
  extends AstWithChildren<AstNodeType.FUNCTION, Ast[]> {
  functionName: string;
}

export const buildFunctionAst: BuildFn<FunctionAst> = (args) =>
  buildAst({
    type: AstNodeType.FUNCTION,
    ...args,
  });

export const isFunctionAst = (ast: unknown): ast is FunctionAst => {
  if (!isAstWithChildren(ast)) return false;

  const { type, functionName } = ast as Partial<FunctionAst>;

  return (
    type === AstNodeType.FUNCTION &&
    typeof functionName === "string" &&
    functionName.length > 0
  );
};

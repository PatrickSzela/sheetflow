import {
  Ast,
  AstNodeType,
  AstWithChildren,
  BuildFn,
  isAstWithChildren,
} from "./ast";

export interface FunctionAst
  extends AstWithChildren<AstNodeType.FUNCTION, Ast[]> {
  functionName: string;
}

export const buildFunctionAst: BuildFn<FunctionAst> = ({ id, ...args }) => ({
  type: AstNodeType.FUNCTION,
  id: id ?? crypto.randomUUID(),
  ...args,
});

export const isFunctionAst = (ast: any): ast is FunctionAst => {
  const { type, functionName } = ast as FunctionAst;

  return (
    isAstWithChildren(ast) &&
    type === AstNodeType.FUNCTION &&
    typeof functionName === "string" &&
    functionName.length > 0
  );
};

declare module "hyperformula/commonjs/parser" {
  import {
    Ast,
    AstNodeType,
    CellAddress,
    Unparser,
    buildLexerConfig,
  } from "hyperformula/typings/parser";

  export { Ast, AstNodeType, CellAddress, Unparser, buildLexerConfig };
}

declare module "hyperformula/commonjs/Config" {
  import { Config } from "hyperformula/typings/Config";

  export { Config };
}

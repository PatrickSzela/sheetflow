declare module "hyperformula/es/parser" {
  import {
    Ast,
    AstNodeType,
    CellAddress,
    Unparser,
    buildLexerConfig,
  } from "hyperformula/typings/parser";

  export { Ast, AstNodeType, CellAddress, Unparser, buildLexerConfig };
}

declare module "hyperformula/es/Config" {
  import { Config } from "hyperformula/typings/Config";

  export { Config };
}

declare module "hyperformula/es/i18n/languages" {
  export { enGB };
}

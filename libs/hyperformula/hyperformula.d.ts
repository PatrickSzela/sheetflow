declare module "hyperformula/es/parser" {
  import {
    Ast,
    AstNodeType,
    buildLexerConfig,
    CellAddress,
    Unparser,
  } from "hyperformula/typings/parser";

  export { Ast, AstNodeType, CellAddress, Unparser, buildLexerConfig };
}

declare module "hyperformula/es/parser/Ast" {
  import { RangeSheetReferenceType } from "hyperformula/typings/parser/Ast";

  export { RangeSheetReferenceType };
}

declare module "hyperformula/es/DependencyGraph/FormulaCellVertex" {
  import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";

  export { FormulaVertex };
}

declare module "hyperformula/es/Config" {
  import { Config } from "hyperformula/typings/Config";

  export { Config };
}

declare module "hyperformula/es/i18n/languages" {
  export { enGB };
}

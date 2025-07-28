declare module "hyperformula/es/parser" {
  import {
    AstNodeType,
    buildLexerConfig,
    CellAddress,
    Unparser,
  } from "hyperformula/typings/parser";

  export { AstNodeType, CellAddress, Unparser, buildLexerConfig };
}

declare module "hyperformula/es/parser/Ast" {
  import { type Ast } from "hyperformula/typings/parser/Ast";
  import {
    AstNodeType,
    RangeSheetReferenceType,
  } from "hyperformula/typings/parser/Ast";

  export { AstNodeType, RangeSheetReferenceType };
  export type { Ast };
}

declare module "hyperformula/es/DependencyGraph/FormulaCellVertex" {
  import { FormulaVertex } from "hyperformula/typings/DependencyGraph/FormulaCellVertex";

  export { FormulaVertex };
}

declare module "hyperformula/es/Config" {
  import { Config } from "hyperformula/typings/Config";

  export { Config };
}

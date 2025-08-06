import { type ParserWithCaching } from "hyperformula/es/parser/ParserWithCaching";
import { type Unparser } from "hyperformula/es/parser/Unparser";

declare module "hyperformula" {
  export interface HyperFormula {
    parser: ParserWithCaching;
    unparser: Unparser;
  }
}

export {};

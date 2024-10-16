import generateUtilityClasses from "@mui/utils/generateUtilityClasses";
import generateUtilityClass from "@mui/utils/generateUtilityClass";

export interface PaperTextFieldClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root if `pill={true}`. */
  pill: string;
}

export type PaperTextFieldClassKey = keyof PaperTextFieldClasses;

export function getPaperTextFieldUtilityClass(slot: string): string {
  return generateUtilityClass("PaperTextField", slot);
}

export const paperTextFieldClasses: PaperTextFieldClasses = generateUtilityClasses(
  "PaperTextField",
  ["root", "pill"]
);

export default paperTextFieldClasses;

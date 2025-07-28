import { type ArgTypes } from "@storybook/react-vite";
import { type PrefixKeys } from "@/libs/utils";

export const preparePrefixedArgTypes = <
  TArgs extends ArgTypes<Record<string, unknown>>,
  TPrefix extends string,
>(
  argTypes: TArgs,
  prefix: TPrefix,
) => {
  const obj: Record<string, unknown> = {};

  for (const key of Object.keys(argTypes)) {
    obj[`${prefix}.${key}`] = {
      name: key,
      ...argTypes[key],
      table: { category: prefix, ...argTypes[key].table },
    };
  }

  return obj as PrefixKeys<TArgs, TPrefix>;
};

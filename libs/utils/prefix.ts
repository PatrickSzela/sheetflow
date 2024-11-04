export type PrefixKeys<
  TObject extends Record<string, unknown>,
  TPrefix extends string
> = {
  [key in keyof TObject as key extends string
    ? `${TPrefix}.${key}`
    : never]: TObject[key];
};

export type PickPrefixedKeys<
  TObject extends Record<string, unknown>,
  TPrefix extends string
> = {
  [key in keyof TObject as key extends `${TPrefix}.${infer TRest}`
    ? TRest
    : never]: TObject[key];
};

export type PickNotPrefixedKeys<
  TObject extends Record<string, unknown>,
  TPrefix extends string
> = {
  [key in keyof TObject as key extends `${TPrefix}.${string}`
    ? never
    : key]: TObject[key];
};

export type GroupPrefixedKeys<
  TObject extends Record<string, unknown>,
  TPrefix extends string
> = PickNotPrefixedKeys<TObject, TPrefix> &
  Record<TPrefix, PickPrefixedKeys<TObject, TPrefix>>;

export const prefixKeys = <
  TObject extends Record<string, unknown>,
  TPrefix extends string
>(
  obj: TObject,
  prefix: TPrefix
): PrefixKeys<TObject, TPrefix> => {
  const newObj: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    newObj[`${prefix}.${key}`] = obj[key];
  }

  return newObj as PrefixKeys<TObject, TPrefix>;
};

export const groupPrefixedKeys = <
  TObject extends Record<string, unknown>,
  TPrefix extends string
>(
  obj: TObject,
  prefix: TPrefix
) => {
  const group: Record<string, unknown> = {};
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    if (key.startsWith(prefix)) {
      group[key.replace(`${prefix}.`, "")] = obj[key];
    } else {
      result[key] = obj[key];
    }
  }

  result[prefix] = group;

  return result as GroupPrefixedKeys<TObject, TPrefix>;
};

type Entry<T> = [keyof T, T[keyof T]];
export const remapValues = <T, E>(
  obj: T,
  mapper: (entry: Entry<T>, index: number, entries: Entry<T>[]) => Entry<E>
): E => {
  return Object.fromEntries(
    Object.entries(obj).map(mapper as any)
  ) as unknown as E;
};

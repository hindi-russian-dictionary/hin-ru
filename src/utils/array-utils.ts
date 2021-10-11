import {Maybe} from 'utils/type-helpers';

export function updateAtArray<T extends NonNullable<unknown>>(
  array: T[],
  index: number,
  value: Maybe<T>
): T[] {
  if (value === undefined) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

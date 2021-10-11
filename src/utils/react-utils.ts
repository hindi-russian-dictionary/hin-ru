import React from 'react';

export function getNextValue<T>(
  prevValue: T,
  setStateAction: React.SetStateAction<T>
): T {
  return typeof setStateAction === 'function'
    ? (setStateAction as (prev: T) => T)(prevValue)
    : setStateAction;
}

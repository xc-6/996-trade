// Learn from https://github.com/react-component/util/blob/master/src/hooks/useEvent.ts

// store the callback func, and sync when the callback func change
// cuz it's store in ref and wrappper by the useCallback, and the deps is [],
// so when callback change, the ref and memoFn won't change, but inner callback(i.e. fnRef.current) update sync.

import { useRef, useCallback } from "react";

export default function useEvent<T extends (...args: any[]) => any>(
  callback?: T,
): T {
  const fnRef = useRef<any>(null);
  fnRef.current = callback;

  const memoFn = useCallback<T>(
    ((...args: any) => fnRef.current?.(...args)) as any,
    [],
  );

  return memoFn;
}

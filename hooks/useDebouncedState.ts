import { debounce } from "lodash-es";
import { useState, useMemo, useCallback } from "react";

export function useDebouncedState<T>(
  initialState: T,
  delay = 300
): [T, (value: T | ((prevState: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(initialState);

  const debouncedSetState = useMemo(() => debounce(setState, delay), [delay]);
  const cancel = useCallback(() => {
    debouncedSetState.cancel();
  }, [debouncedSetState]);

  return [state, debouncedSetState, cancel];
}

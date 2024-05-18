import { useEffect, useRef, useState } from 'react';

/**
 * 防抖state
 *
 * @param initialValue
 * @param timeout
 * @returns
 */
export function useDebouncedState(initialValue, timeout = 100) {
  const [value, setValue] = useState({ value: initialValue });
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const handler = useRef<number>();

  useEffect(() => {
    handler.current = window.setTimeout(() => {
      setDebouncedValue(value.value);
    }, timeout);
    return () => {
      window.clearTimeout(handler.current);
    };
  }, [value, timeout]);

  return [
    // X
    debouncedValue,
    // setX
    (newValue) => {
      setValue({ value: newValue });
    },
    // setXImmediate
    (newValue) => {
      window.clearTimeout(handler.current);
      setDebouncedValue(newValue);
    },
    // cancelSetX
    () => window.clearTimeout(handler.current),
  ];
}

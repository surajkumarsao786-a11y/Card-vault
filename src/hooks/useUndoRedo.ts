import { useState, useCallback } from 'react';

export function useUndoRedo(initialState: string) {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState<string[]>([initialState]);
  const [pointer, setPointer] = useState(0);

  const set = useCallback((v: string) => {
    setState(v);
    setHistory((prev) => {
      const newHistory = prev.slice(0, pointer + 1);
      newHistory.push(v);
      return newHistory;
    });
    setPointer((prev) => prev + 1);
  }, [pointer]);

  const undo = useCallback(() => {
    if (pointer > 0) {
      setPointer((prev) => prev - 1);
      setState(history[pointer - 1]);
      return history[pointer - 1];
    }
    return undefined;
  }, [history, pointer]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      setPointer((prev) => prev + 1);
      setState(history[pointer + 1]);
      return history[pointer + 1];
    }
    return undefined;
  }, [history, pointer]);

  const reset = useCallback((v: string) => {
    setState(v);
    setHistory([v]);
    setPointer(0);
  }, []);

  return { state, set, undo, redo, reset, canUndo: pointer > 0, canRedo: pointer < history.length - 1 };
}

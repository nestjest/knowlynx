import { useEffect, useId, useLayoutEffect } from 'react';
import {
  useActionBarStore,
  type ActionBarAction,
} from '@/shared/model/useActionBarStore';

export function useActionBar(actions: ActionBarAction[] | null) {
  const id = useId();

  useLayoutEffect(() => {
    if (actions === null) {
      useActionBarStore.getState().clearContext(id);
      return;
    }
    useActionBarStore.getState().setContext(id, actions);
  });

  useEffect(() => {
    return () => {
      useActionBarStore.getState().clearContext(id);
    };
  }, [id]);
}

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bootstrapAuth } from './authSlice.js';

/** Kick off a silent session restore once on app start. */
export function useAuthBootstrap() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);
}

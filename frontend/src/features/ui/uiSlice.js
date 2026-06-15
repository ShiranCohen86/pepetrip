import { createSlice } from '@reduxjs/toolkit';

function readTheme() {
  try {
    return localStorage.getItem('pt_theme') || 'system';
  } catch {
    return 'system';
  }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme: readTheme() },
  reducers: {
    setTheme(state, { payload }) {
      state.theme = payload;
      try {
        localStorage.setItem('pt_theme', payload);
      } catch {
        /* storage unavailable — keep in-memory only */
      }
    },
  },
});

export const { setTheme } = uiSlice.actions;
export default uiSlice.reducer;

export const selectTheme = (s) => s.ui.theme;

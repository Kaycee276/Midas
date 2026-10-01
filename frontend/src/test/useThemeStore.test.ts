import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../stores/useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles theme between dark and light', () => {
    const initialTheme = useThemeStore.getState().theme;
    useThemeStore.getState().toggleTheme();

    const newTheme = useThemeStore.getState().theme;
    expect(newTheme).not.toBe(initialTheme);

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe(initialTheme);
  });
});

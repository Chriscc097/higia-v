// panelStore.js
import { create } from 'zustand';

export const usePanelStore = create((set) => ({
  currentPanel: 'dashboard',
  changePanel: (newPanelName) => set({ currentPanel: newPanelName }),
}));

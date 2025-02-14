// panelStore.js
import { create } from 'zustand';

export const usePanelStore = create((set) => ({
  currentPanel: 'loads',
  changePanel: (newPanelName) => set({ currentPanel: newPanelName }),
}));

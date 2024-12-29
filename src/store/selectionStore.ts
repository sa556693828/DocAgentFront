import { create } from "zustand";

interface SelectionState {
  selectedRowKeysState: React.Key[];
  setSelectedRowKeysState: (keys: React.Key[]) => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedRowKeysState: [],
  setSelectedRowKeysState: (keys) => set({ selectedRowKeysState: [...keys] }),
}));

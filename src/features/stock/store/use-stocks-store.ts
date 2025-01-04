import { create } from "zustand";
import { StockInfo } from "@/lib/types";

type BuyRecordState = {
  init: boolean;
  stocksCodes?: string[];
  stocksState: Map<string, StockInfo>;
  setStocksCodes: (data: string[]) => void;
  setInit: (data: boolean) => void;
  setStocksState: (data: Map<string, StockInfo>) => void;
  refreshTime: number;
};

export const useStocksState = create<BuyRecordState>((set) => ({
  init: false,
  stocksCodes: [],
  stocksState: new Map<string, StockInfo>(),
  setStocksCodes: (data: string[]) => set({ stocksCodes: data }),
  setInit: (data: boolean) => set({ init: data }),
  setStocksState: (data: Map<string, StockInfo>) => set({ stocksState: data }),
  refreshTime: 10000,
}));

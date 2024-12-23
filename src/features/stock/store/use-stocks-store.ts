import { create } from "zustand";
import { StockInfo } from "@/lib/types";

type BuyRecordState = {
    stocksCodes?: string[];
    stocksState?: Map<string, StockInfo>;
    setStocksCodes: (data: string[]) => void,
    setStocksState: (data: Map<string, StockInfo>) => void
    refreshTime: number
};

export const useStocksState = create<BuyRecordState>((set) => ({
    stocksCodes: [],
    stocksState: new Map<string, StockInfo>(),
    setStocksCodes: (data: string[]) => set({ stocksCodes: data }),
    setStocksState: (data: Map<string, StockInfo>) => set({ stocksState: data }),
    refreshTime: 200000
}));

import { create } from "zustand";
import { BuyRecord } from "@/lib/types";

type BuyRecordState = {
  buyRecord?: BuyRecord;
  setBuyRecord: (data: BuyRecord) => void;
};

export const useBuyRecordState = create<BuyRecordState>((set) => ({
  buyRecord: {} as BuyRecord,
  setBuyRecord: (data: BuyRecord) => set({ buyRecord: data }),
}));

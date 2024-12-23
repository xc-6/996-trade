import { useEffect, useRef } from "react";
import { useStocksState } from "../store/use-stocks-store";
import { useGetStocks } from "./use-get-stocks";
import { StockInfo } from "@/lib/types";

export const useStocks = () => {
  const timer = useRef<any>(null);
  const { stocksCodes, stocksState, setStocksCodes, setStocksState, refreshTime } =
    useStocksState();
  const { data, refetch, isLoading } = useGetStocks(stocksCodes ?? []);

  useEffect(() => {
    if (data) {
      const map = new Map(
        data?.map((obj: StockInfo) => [obj.code, obj]) ?? []
      ) as Map<string, StockInfo>;
      setStocksState(map);

      timer.current = setInterval(() => {
        refetch();
      }, refreshTime);
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [data, refetch, refreshTime, setStocksState]);

  useEffect(() => {
    if (stocksCodes?.length) {
      refetch();
    }
  }, [refetch, stocksCodes]);

  return {
    stocksCodes,
    stocksState,
    setStocksCodes,
    setStocksState,
    refetch,
    isLoading,
  };
};

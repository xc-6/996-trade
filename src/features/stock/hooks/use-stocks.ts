import { useCallback, useEffect, useRef } from "react";
import { useStocksState } from "../store/use-stocks-store";
import { useGetStocks } from "./use-get-stocks";
import { StockInfo } from "@/lib/types";
import { isMarketOpen } from "@/lib/utils";
import { useDocumentVisibility } from "ahooks";

export const useStocks = () => {
  const timer = useRef<any>(null);
  const {
    stocksCodes,
    stocksState,
    setStocksCodes,
    setStocksState,
    setInit,
    init,
    refreshTime,
  } = useStocksState();
  const documentVisibility = useDocumentVisibility();
  const { data, refetch, isLoading } = useGetStocks(stocksCodes ?? []);
  const visible = documentVisibility && documentVisibility != "hidden";

  const _refecth = useCallback(() => {
    if (!visible) {
      return;
    }
    if (!init || isMarketOpen(stocksCodes ?? [])) {
      refetch();
    }
  }, [stocksCodes, refetch, init, visible]);

  useEffect(() => {
    if (data) {
      const map = new Map(
        data?.map((obj: StockInfo) => [obj.code, obj]) ?? [],
      ) as Map<string, StockInfo>;
      setStocksState(map);
      setInit(true);

      timer.current = setInterval(() => {
        _refecth();
      }, refreshTime);
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [data, _refecth, refreshTime, setStocksState, setInit]);

  useEffect(() => {
    _refecth();
  }, [_refecth]);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  return {
    stocksCodes,
    stocksState,
    setStocksCodes,
    setStocksState,
    refetch,
    isLoading,
    clearTimer,
  };
};

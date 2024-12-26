import { useEffect } from "react";
import { useGetStockcodes } from "./use-get-stockcodes";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useStocks } from "./use-stocks";

export const useRefreshStocks = () => {
  const { setStocksCodes, clearTimer } = useStocks();
  const { activeIds } = useActiveAccounts();
  const {
    data: stockcodes,
    isSuccess,
    refetch,
    isLoading,
  } = useGetStockcodes(activeIds ?? []);
  useEffect(() => {
    if (isSuccess) {
      setStocksCodes(stockcodes);
    }
  }, [isSuccess, stockcodes, setStocksCodes]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    refetch,
    stockcodes,
    isLoading,
  };
};

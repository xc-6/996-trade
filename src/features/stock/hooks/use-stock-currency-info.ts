import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useStocksState } from "../store/use-stocks-store";
import { useGetRecordsByStock } from "@/features/record/hooks/use-get-records-by-stock";
import { useMemo } from "react";
import { CURRENCY_GROUP } from "@/lib/const";
import { reverseMapping } from "@/lib/utils";

export const useStockCurrencyInfo = () => {
  const { activeIds } = useActiveAccounts();
  const { stocksState } = useStocksState();
  const { data, isLoading } = useGetRecordsByStock(activeIds ?? []);

  const exchange2Currency = useMemo(() => {
    return reverseMapping(CURRENCY_GROUP);
  }, []);
  const asset = useMemo(() => {
    const currencys = Object.keys(CURRENCY_GROUP);
    const res = Object.fromEntries(currencys.map((key) => [key, 0]));
    if (isLoading) {
      return res;
    }
    return (
      Object.keys(data ?? {}).reduce((obj, item) => {
        const exchange = item.slice(0, 2);
        const currency = exchange2Currency[exchange];
        obj[currency] +=
          (data?.[item].totalUnsoldAmount ?? 0) *
          (stocksState.get(item)?.now ?? 0);
        return obj;
      }, res) ?? res
    );
  }, [data, exchange2Currency, isLoading, stocksState]);

  const cost = useMemo(() => {
    const currencys = Object.keys(CURRENCY_GROUP);
    const res = Object.fromEntries(currencys.map((key) => [key, 0]));
    if (isLoading) {
      return res;
    }
    return (
      Object.keys(data ?? {}).reduce((obj, item) => {
        const exchange = item.slice(0, 2);
        const currency = exchange2Currency[exchange];
        obj[currency] += data?.[item].totalCost ?? 0;
        return obj;
      }, res) ?? res
    );
  }, [data, exchange2Currency, isLoading]);

  return {
    asset,
    cost,
  };
};

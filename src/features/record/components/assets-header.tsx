import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useGetRecordsByStock } from "../hooks/use-get-records-by-stock";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { CURRENCY, CURRENCY_GROUP } from "@/lib/const";
import { useMemo } from "react";
import { currencyFormatter, reverseMapping } from "@/lib/utils";

export const AssetsHeader = () => {
  const { activeIds, accountsMenu } = useActiveAccounts();
  const { stocksState } = useStocksState();
  const { data, isLoading } = useGetRecordsByStock(activeIds ?? []);

  const order = useMemo(() => {
    return CURRENCY.filter((item) =>
      accountsMenu.some((menu) => menu.label === item),
    );
  }, [accountsMenu]);

  const exchange2Currency = useMemo(() => {
    return reverseMapping(CURRENCY_GROUP);
  }, []);

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

  const PL = useMemo(() => {
    const currencys = Object.keys(CURRENCY_GROUP);
    const res = Object.fromEntries(currencys.map((key) => [key, 0]));
    if (isLoading) {
      return res;
    }
    return (
      Object.keys(data ?? {}).reduce((obj, item) => {
        const exchange = item.slice(0, 2);
        const currency = exchange2Currency[exchange];
        obj[currency] += data?.[item].totalPL ?? 0;
        return obj;
      }, res) ?? res
    );
  }, [data, exchange2Currency, isLoading]);

  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">Total Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text font-bold">
            {order.map((key) => {
              return (
                <div key={key}>
                  {key}: {currencyFormatter(key, asset[key])}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">Total PL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text font-bold">
            {order.map((key) => {
              return (
                <div key={key}>
                  {key}: {currencyFormatter(key, PL[key])}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">Total Cost</CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="text font-bold">
            {order.map((key) => {
              return (
                <div key={key}>
                  {key}: {currencyFormatter(key, cost[key])}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

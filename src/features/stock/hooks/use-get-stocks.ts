import { useQuery } from "@tanstack/react-query";
import { stocks as stocksApi } from "stock-api";

export const useGetStocks = (stocks: Array<string>) => {
  const query = useQuery({
    enabled: stocks.length > 0,
    queryKey: ["stocks", stocks],
    queryFn: async () => {
      const data = await stocksApi.tencent.getStocks(stocks);
      return data;
    },
  });

  return query;
};

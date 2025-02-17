import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Filter } from "@/lib/types";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["sell_record"]["$post"],
  200
>;

export const useGetSellRecords = (
  accountIds: Array<string>,
  stockCode: Array<string>,
  filter: Filter,
) => {
  const query = useQuery({
    enabled: !!accountIds.length,
    queryKey: ["sellRecords", accountIds, filter, stockCode],
    queryFn: async () => {
      if (!accountIds.length) {
        return [];
      }
      const json:any = {
          accountIds,
          filter,
      }
      if (stockCode?.length) {
        json["stockCode"] = stockCode
      }
      const response = await client.api.records.sell_record.$post({
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

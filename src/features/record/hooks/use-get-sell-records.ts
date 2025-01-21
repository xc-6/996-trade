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
  filter: Filter,
) => {
  const query = useQuery({
    enabled: !!accountIds.length,
    queryKey: ["sellRecords", accountIds, filter],
    queryFn: async () => {
      if (!accountIds.length) {
        return [];
      }
      const response = await client.api.records.sell_record.$post({
        json: {
          accountIds,
          filter,
        },
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

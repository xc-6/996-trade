import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["sell_records"]["$get"],
  200
>;

export const useGetSellRecords = (accountIds: Array<string>) => {
  const query = useQuery({
    enabled: !!accountIds.length,
    queryKey: ["sellRecords", accountIds],
    queryFn: async () => {
      if (!accountIds.length) {
        return [];
      }
      const response = await client.api.records.sell_records.$get({
        query: {
          accountIds: accountIds.join(","),
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

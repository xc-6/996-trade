import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records.div_record.stock_codes)["$post"],
  200
>;

export const useGetDivStockcodes = (accountIds: Array<string>) => {
  const query = useQuery({
    enabled: accountIds.length > 0,
    queryKey: ["batch", "stockcodes", accountIds],
    queryFn: async () => {
      const response = await client.api.records.div_record.stock_codes.$post({
        json: {
          accountIds,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stockcodes");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

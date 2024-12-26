import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records.stock_codes)["$get"],
  200
>;

export const useGetStockcodes = (accountIds: Array<string>) => {
  const query = useQuery({
    enabled: accountIds.length > 0,
    queryKey: ["stockcodes", accountIds],
    queryFn: async () => {
      const response = await client.api.records.stock_codes.$get({
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

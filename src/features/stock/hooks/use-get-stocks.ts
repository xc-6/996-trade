import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";


export type ResponseType = InferResponseType<typeof client.api.stocks["$get"], 200>;

export const useGetStocks = (stocks: Array<string>) => {
  const query = useQuery({
    enabled: stocks.length > 0,
    queryKey: ["stocks", stocks],
    queryFn: async () => {
      const response = await client.api.stocks.$get({
        query: {
          input: stocks.join(',')
        }
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

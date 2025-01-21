import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["div_record"]["batch"]["$post"],
  200
>;

export const useGetDivBatches = (
  accountIds: Array<string>,
  stockCode: string,
) => {
  const query = useQuery({
    enabled: !!accountIds.length,
    queryKey: ["divBatches", accountIds, stockCode],
    queryFn: async () => {
      const response = await client.api.records.div_record.batch.$post({
        json: {
          accountIds,
          stockCode,
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

import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["div_record"]["batch"][":batchId"]["$get"],
  200
>;

export const useGetDivBatch = (batchId: string) => {
  const query = useQuery({
    enabled: !!batchId,
    queryKey: ["divBatches", "info", batchId],
    queryFn: async () => {
      const response = await client.api.records.div_record.batch[
        ":batchId"
      ].$get({
        param: {
          batchId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch div batch");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

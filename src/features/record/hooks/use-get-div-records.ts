import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["div_record"]["buy_record"][":buyRecordId"]["$get"],
  200
>;

export const useGetDivRecords = (buyRecordId: string) => {
  const query = useQuery({
    enabled: !!buyRecordId,
    queryKey: ["divRecrords", "buyRecord", buyRecordId],
    queryFn: async () => {
      const response = await client.api.records.div_record.buy_record[
        ":buyRecordId"
      ].$get({
        param: {
          buyRecordId,
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

import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)[":id"]["$get"],
  200
>;

export const useGetBuyRecord = (id: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["buyRecords", id],
    queryFn: async () => {
      const response = await client.api.records[":id"].$get({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch buy record");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

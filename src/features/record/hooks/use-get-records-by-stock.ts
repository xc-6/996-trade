import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { toast } from "sonner";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["stock_groups"]["$get"],
  200
>;

export const useGetRecordsByStock = (accountIds: Array<string>) => {
  const query = useQuery({
    queryKey: ["buyRecordsByStock", accountIds],
    queryFn: async () => {
      const response = await client.api.records.stock_groups.$get({
        query: {
          accountIds: accountIds.join(","),
        },
      });

      if (!response.ok) {
        const { error } = await response.json();
        toast.error("Failed to fetch the records. " + error);
        throw new Error("Failed to fetch the records");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

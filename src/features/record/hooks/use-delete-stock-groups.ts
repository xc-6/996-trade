import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.records.stock_groups)[":stockCode"]["$delete"],
  200
>;

type RequestType = InferRequestType<
  (typeof client.api.records.stock_groups)[":stockCode"]["$delete"]
>;

export const useDeleteStockGroups = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, query }) => {
      const response = await client.api.records.stock_groups[
        ":stockCode"
      ].$delete({
        param,
        query,
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      return await response.json();
    },
    onSuccess: (_, {}) => {
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["buyRecordsByStock"],
      });
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  return mutation;
};

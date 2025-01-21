import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.records)["div_record"]["batch"][":batchId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.records)["div_record"]["batch"][":batchId"]["$delete"]
>["param"];

export const useDeleteDivBatch = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.records.div_record.batch[
        ":batchId"
      ].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete dividend Batch");
      }

      return await response.json();
    },
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ["divBatches"] });
      queryClient.invalidateQueries({
        queryKey: ["divBatches", "info", batchId],
      });
    },
    onError: () => {
      toast.error("Failed to delete dividend batch");
    },
  });

  return mutation;
};

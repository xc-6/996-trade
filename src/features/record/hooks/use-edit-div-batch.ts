import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.records)["div_record"]["batch"][":batchId"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.records)["div_record"]["batch"][":batchId"]["$post"]
>;

export const useEditDivBatch = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.records.div_record.batch[
        ":batchId"
      ].$post({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to delete dividend Batch");
      }

      return await response.json();
    },
    onSuccess: (_, { param: { batchId } }) => {
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

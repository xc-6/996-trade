import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.records)[":buyRecordId"]["sell"][":sellRecordId"]["$delete"],
  200
>;

type RequestType = InferRequestType<
  (typeof client.api.records)[":buyRecordId"]["sell"][":sellRecordId"]["$delete"]
>["param"];

export const useDeleteSellRecord = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ buyRecordId, sellRecordId }) => {
      const response = await client.api.records[":buyRecordId"].sell[
        ":sellRecordId"
      ].$delete({
        param: { buyRecordId, sellRecordId },
      });

      if (!response.ok) {
        throw new Error("Failed to delete sell record");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
      // reloading the window to reflect the changes
      window.location.reload();
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  return mutation;
};

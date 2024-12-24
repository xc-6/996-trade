import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.records)[":id"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.records)[":id"]["$delete"]
>["param"];

export const useDeleteBuyRecord = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.records[":id"].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      return await response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["buyRecords", id],
      });
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  return mutation;
};

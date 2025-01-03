import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.accounts)[":id"]["$delete"]
>["param"];

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.accounts[":id"].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete Account");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account deleted");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
      queryClient.invalidateQueries({ queryKey: ["stockcodes"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: () => {
      toast.error("Account delete Error!");
    },
  });

  return mutation;
};

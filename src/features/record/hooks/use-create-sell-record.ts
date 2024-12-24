import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)[":buyRecordId"]["sell"]["$post"],
  200
>;
export type RequestType = InferRequestType<
  (typeof client.api.records)[":buyRecordId"]["sell"]["$post"]
>;

export const useCreateSellRecord = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.records[":buyRecordId"]["sell"].$post({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();

      return data;
    },
    onSuccess: (_, { param }) => {
      toast.success("SellRecord created");
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["buyRecords", param.buyRecordId],
      });
    },
    onError: () => {
      toast.error("SellRecord create Error!");
    },
  });

  return mutation;
};

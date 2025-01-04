import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records.buy_record)[":id"]["$post"],
  200
>;
export type RequestType = InferRequestType<
  (typeof client.api.records.buy_record)[":id"]["$post"]
>;

export const useEditBuyRecord = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (req) => {
      const response = await client.api.records.buy_record[":id"].$post(req);

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const data = await response.json();

      return data;
    },
    onSuccess: () => {
      toast.success("BuyRecord updated");
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
    },
    onError: (error) => {
      toast.error("BuyRecord update Error! " + error.message);
    },
  });

  return mutation;
};

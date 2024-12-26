import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records.buy_record)["$post"],
  200
>;
export type RequestType = InferRequestType<
  (typeof client.api.records.buy_record)["$post"]
>["json"];

export const useCreateBuyRecord = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.records.buy_record.$post({ json });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();

      return data;
    },
    onSuccess: () => {
      toast.success("BuyRecord created");
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
      queryClient.invalidateQueries({ queryKey: ["stockcodes"] });
    },
    onError: () => {
      toast.error("BuyRecord create Error!");
    },
  });

  return mutation;
};

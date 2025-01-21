import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["div_record"]["$post"],
  200
>;
export type RequestType = InferRequestType<
  (typeof client.api.records)["div_record"]["$post"]
>;

export const useCreateDivRecord = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.records["div_record"].$post({
        json,
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();

      return data;
    },
    onSuccess: (_, { json }) => {
      const ids = json.list.map((item) => item.buyRecordId);
      for (const id of ids) {
        queryClient.invalidateQueries({ queryKey: ["buyRecords", id] });
      }
      toast.success("Dividend Record created!");
    },
    onError: () => {
      toast.error("Dividend Record create Error!");
    },
  });

  return mutation;
};

import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.uploads.records)["$post"],
  200
>;
export type RequestType = InferRequestType<
  (typeof client.api.uploads.records)["$post"]
>["json"];

export const useUploadRecords = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.uploads.records.$post({ json });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const data = await response.json();

      return data;
    },
    onSuccess: () => {
      toast.success("Records Upload Success!");
      queryClient.invalidateQueries({ queryKey: ["buyRecords"] });
      queryClient.invalidateQueries({ queryKey: ["stockcodes"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (error) => {
      toast.error("Records Upload Error! " + error.message);
    },
  });

  return mutation;
};

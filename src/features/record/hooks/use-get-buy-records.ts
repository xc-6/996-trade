import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["buy_records"]["$get"],
  200
>;

export const useGetBuyRecords = (
  accountIds: Array<string>,
  stockCode?: string,
  showSold?: boolean,
) => {
  const query = useQuery({
    enabled: !!accountIds.length,
    queryKey: ["buyRecords", accountIds, stockCode],
    queryFn: () => queryFn(accountIds, stockCode, showSold),
  });

  return query;
};

export const queryFn = async (
  accountIds: Array<string>,
  stockCode?: string,
  showSold?: boolean,
) => {
  if (!accountIds.length) {
    return [];
  }
  const response = await client.api.records.buy_records.$get({
    query: {
      accountIds: accountIds.join(","),
      stockCode,
      showSold: showSold?.toString(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  const { data } = await response.json();
  return data;
};

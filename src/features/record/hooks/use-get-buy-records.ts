import { useInfiniteQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Filter, Sort } from "@/lib/types";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["buy_record"]["list"]["$post"],
  200
>;

interface Params {
  accountIds: Array<string>;
  filter?: Filter;
  sort?: Sort;
  stockCode?: Array<string>;
  showSold?: boolean;
  fetchAll?: boolean;
}

export const useGetBuyRecords = ({
  accountIds,
  filter,
  sort,
  stockCode,
  showSold,
  fetchAll,
}: Params) => {
  const query = useInfiniteQuery<ResponseType, Error>({
    staleTime: 0,
    enabled: !!accountIds.length,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    queryKey: ["buyRecords", accountIds, stockCode, filter, sort, fetchAll],
    queryFn: ({ pageParam }) =>
      queryFn(
        {
          accountIds,
          stockCode,
          showSold,
        },
        filter,
        sort,
        fetchAll
          ? undefined
          : {
              page: pageParam as unknown as number,
            },
      ),
  });

  return query;
};

interface Options {
  accountIds: Array<string>;
  stockCode?: Array<string>;
  showSold?: boolean;
}

interface Pagnation {
  page: number;
  limit?: number;
}

export const queryFn = async (
  { accountIds, stockCode, showSold }: Options,
  filter?: Filter,
  sort?: Sort,
  pageParam?: Pagnation,
) => {
  if (!accountIds.length) {
    return {
      data: [],
      nextPage: null,
      total: 0,
    };
  }

  sort = sort ?? {
    key: "buyDate",
    order: "desc",
  };

  pageParam = pageParam ?? {
    page: 1,
    limit: Number.MAX_SAFE_INTEGER,
  };
  const page = pageParam?.page ?? 1;
  const limit = pageParam?.limit ?? 50;
  const json: any = {
    accountIds: accountIds,
    showSold: showSold ?? false,
    page,
    limit,
    filter,
    ...sort,
  };
  if (stockCode?.length) {
    json["stockCode"] = stockCode;
  }
  const response = await client.api.records.buy_record.list.$post({
    json,
  });

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  return response.json();
};

import { useInfiniteQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Filter, Sort } from "@/lib/types";

export type ResponseType = InferResponseType<
  (typeof client.api.records)["buy_records"]["$post"],
  200
>;

export const useGetBuyRecords = (
  accountIds: Array<string>,
  filter?: Filter,
  sort?: Sort,
  stockCode?: string,
  showSold?: boolean,
) => {
  const query = useInfiniteQuery<ResponseType, Error>({
    staleTime: 0,
    enabled: !!accountIds.length,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    queryKey: ["buyRecords", accountIds, stockCode, filter, sort],
    queryFn: ({ pageParam }) =>
      queryFn(
        {
          accountIds,
          stockCode,
          showSold,
        },
        filter,
        sort,
        Object.keys(sort ?? {}).length == 0
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
  stockCode?: string;
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
  const response = await client.api.records.buy_records.$post({
    json: {
      accountIds: accountIds,
      stockCode,
      showSold: showSold ?? false,
      page,
      limit,
      filter,
      ...sort,
    },
  });

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  return response.json();
};

import { Column, DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetRecordsByStock } from "../hooks/use-get-records-by-stock";
import { Loader } from "lucide-react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { BuyRecordTable } from "./buy-record-table";
import { cn, numberFormatter } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { Fragment, useEffect, useMemo } from "react";
import { Trash2, MoveDown, MoveUp } from "lucide-react";
import { ResponseType } from "../hooks/use-get-records-by-stock";
import { useDeleteStockGroups } from "../hooks/use-delete-stock-groups";
import { defaultFilter } from "../deafult";
import { StockInfo } from "@/lib/types";

type StockRecord = ResponseType["data"][0] &
  StockInfo & {
    price: number;
    unrealized: number;
    total: number;
    totalCost: number;
    totalAmount: number;
    totalUnrealized: number;
    totalPercent: number;
    accountName: string;
    up: boolean;
    stockCode: string;
  };
const Table = DataTable<StockRecord>;
export const StockRecordTable = () => {
  const { stocksState } = useStocksState();
  const { activeIds } = useActiveAccounts();
  const { data, isLoading, refetch } = useGetRecordsByStock(activeIds ?? []);
  const removeMutation = useDeleteStockGroups();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this record.",
  );

  const columns: Array<Column<StockRecord>> = [
    {
      key: "expand",
      label: "",
      type: "expand",
      className: "w-[20px]",
      render: (item) => {
        return (
          <BuyRecordTable
            showHeader={false}
            stockCode={item.stockCode}
            key={`${item.stockCode}-table`}
          />
        );
      },
    },
    {
      key: "stockCode",
      label: "Code",
      render: (item) => {
        return (
          <>
            <Badge variant="outline" className="mr-2">
              {item.stockCode.slice(0, 2)}
            </Badge>
            {item.stockCode.slice(2)}
          </>
        );
      },
    },
    {
      key: "name",
      label: "Name",
      className: "font-medium",
      render: (item) => item.name ?? "",
    },
    {
      key: "price",
      label: "Price",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
      render: (item) => (
        <>
          {item.up ? (
            <MoveUp size={16} className="inline" />
          ) : (
            <MoveDown size={16} className="inline" />
          )}
          {item.price}
        </>
      ),
    },
    {
      key: "buyPrice",
      label: "Cost",
    },
    {
      key: "unrealized",
      label: "Unrealized P&L",
      className: ({ unrealized }) =>
        cn(unrealized > 0 ? "text-red-500 font-bold" : "text-green-500"),
      render: ({ unrealized, totalCost }) => (
        <>
          {numberFormatter(unrealized)}
          <span>({((unrealized / totalCost) * 100).toFixed(2)}%)</span>
        </>
      ),
    },
    {
      key: "percent",
      label: "TPC",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
      render: (item) => `${item.percent} %`,
    },
    {
      key: "high",
      label: "High",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
    },
    {
      key: "low",
      label: "Low",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
    },
    {
      key: "yesterday",
      label: "Yesterday",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
    },
    {
      key: "totalCost",
      label: "Total Cost",
      render: (item) => numberFormatter(item.totalCost),
    },
    {
      key: "totalUnsoldAmount",
      label: "Unsold Amount",
      filterable: true,
      render: (item) =>
        item.totalUnsoldAmount.toLocaleString("en-US", {
          maximumFractionDigits: 4,
        }),
    },
    {
      key: "buyAmount",
      label: "Buy Amount",
      render: (item) =>
        item.totalBuyAmount.toLocaleString("en-US", {
          maximumFractionDigits: 4,
        }),
    },
    {
      key: "totalUnrealized",
      label: "Realized P&L",
      render: (item) => numberFormatter(item.totalPL),
    },
    {
      key: "accountName",
      label: "Account",
    },
    {
      key: "buyDate",
      label: "Buy Date",
      sortable: false,
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (item) => (
        <Trash2
          size={16}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={(e) => onDelete(e, item.stockCode)}
        />
      ),
    },
  ];

  const list = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const res = Object.keys(data ?? {})?.map((stockCode) => {
      const record = data?.[stockCode];
      const buyPrice = record?.avgCost ?? 0;
      const name = stocksState?.get(stockCode)?.name;
      const percent = (
        (stocksState?.get(stockCode)?.percent ?? 0) * 100
      ).toFixed(2);
      const price = stocksState?.get(stockCode)?.now ?? buyPrice;
      const unrealizedPL =
        (record?.totalUnsoldAmount ?? 0) * price - (record?.totalCost ?? 0);
      const high = stocksState?.get(stockCode)?.high ?? "N/A";
      const low = stocksState?.get(stockCode)?.low ?? "N/A";
      const yesterday = stocksState?.get(stockCode)?.yesterday ?? "N/A";
      const totalCost = buyPrice * (record?.totalUnsoldAmount ?? 0);
      const totalPL = record?.totalPL ?? 0;
      const totalBuyAmount = record?.totalBuyAmount ?? 0;
      const totalUnsoldAmount = record?.totalUnsoldAmount ?? 0;
      const up = (stocksState?.get(stockCode)?.percent ?? 0) >= 0;

      return {
        ...record,
        stockCode,
        buyPrice,
        unrealized: unrealizedPL,
        name,
        percent,
        price,
        high,
        low,
        yesterday,
        up,
        totalBuyAmount,
        totalUnsoldAmount,
        totalCost,
        totalPL,
      };
    });

    return res as unknown as StockRecord[];
  }, [isLoading, data, stocksState]);

  const onDelete = async (e: React.MouseEvent, stockCode: string) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok) {
      removeMutation.mutate({
        param: { stockCode },
        query: {
          accountIds: activeIds?.join(",") ?? "",
        },
      });
    }
  };

  useEffect(() => {
    refetch();
  }, [activeIds, refetch]);

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <Table
      defaultFilter={defaultFilter}
      data={list}
      columns={columns}
      dataIndex="stockCode"
      className="mb-2"
      rowClassName={"group"}
    >
      <ConfirmDialog />
    </Table>
  );
};

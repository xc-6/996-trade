"use client";
import { Column, DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { useGetBuyRecords } from "../hooks/use-get-buy-records";
import { useDeleteBuyRecord } from "../hooks/use-delete-buy-record";
import { Pencil } from "lucide-react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { format } from "date-fns";
import { usePanel } from "../hooks/use-panel";
import { useMemo, useState, memo } from "react";
import { Trash2, MoveDown, MoveUp } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { cn, numberFormatter } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { ResponseType } from "../hooks/use-get-buy-records";

import { useModal } from "@/hooks/use-modal-store";
import { unsoldAmount } from "../deafult";
import { StockInfo, Sort, Filter } from "@/lib/types";

type BuyRecord = ResponseType["data"][0] &
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
  };
interface BuyRecordTableProps {
  showHeader?: boolean;
  stockCode?: string;
  style?: React.CSSProperties;
}
const Table = memo(DataTable<BuyRecord>);

const _defaultFilter = { unsoldAmount };
export const BuyRecordTable = ({
  showHeader = true,
  stockCode,
  ...props
}: BuyRecordTableProps = {}) => {
  const { onOpen } = useModal();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this record.",
  );
  const { onSelect, recordId } = usePanel();
  const { stocksState } = useStocksState();
  const { activeIds, mapping } = useActiveAccounts();
  const removeMutation = useDeleteBuyRecord();
  const [filter, setFilter] = useState<Filter>({ ..._defaultFilter });
  const [sort, setSort] = useState<Sort>({
    key: "buyDate",
    order: "desc",
  });
  const { data, status, fetchNextPage, hasNextPage } = useGetBuyRecords(
    activeIds ?? [],
    filter,
    sort,
    stockCode,
  );

  const isLoading = status == "pending";

  const columns: Array<Column<BuyRecord>> = [
    {
      key: "placeholder",
      label: "",
      className: cn(showHeader && "w-[20px]"),
      sortable: false,
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
      sortable: "local",
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
      sortable: "local",
    },
    {
      key: "buyPrice",
      label: "Cost",
      sortable: "local",
    },
    {
      key: "unrealized",
      label: "Unrealized P&L",
      className: ({ unrealized }) =>
        cn(unrealized > 0 ? "text-red-500 font-bold" : "text-green-500"),
      render: (item) => (
        <>
          {numberFormatter((item.price - item.buyPrice) * item.unsoldAmount)}
          <span className="text-sm">({item.unrealized.toFixed(2)}%)</span>
        </>
      ),
      sortable: "local",
    },
    {
      key: "percent",
      label: "TPC",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
      render: (item) => `${item.percent} %`,
      sortable: "local",
    },
    {
      key: "high",
      label: "High",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
      sortable: "local",
    },
    {
      key: "low",
      label: "Low",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
      sortable: "local",
    },
    {
      key: "yesterday",
      label: "Yesterday",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
      sortable: "local",
    },
    {
      key: "totalCost",
      label: "Total Cost",
      render: (item) => numberFormatter(item.totalCost),
      sortable: "local",
    },
    {
      key: "unsoldAmount",
      label: "Unsold Amount",
      filterable: true,
      render: (item) =>
        item.unsoldAmount.toLocaleString("en-US", { maximumFractionDigits: 4 }),
    },
    {
      key: "buyAmount",
      label: "Buy Amount",
      render: (item) =>
        item.buyAmount.toLocaleString("en-US", { maximumFractionDigits: 4 }),
    },
    {
      key: "profitLoss",
      label: "Realized P&L",
      render: (item) => numberFormatter(item.profitLoss),
    },
    {
      key: "accountName",
      label: "Account",
      sortable: "local",
    },
    {
      key: "buyDate",
      label: "Buy Date",
      render: (item) => format(new Date(item.buyDate), "PPP"),
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      className: "flex flex-row gap-2 items-center",
      render: (record: BuyRecord) => (
        <>
          <Pencil
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={(e) => onEdit(e, record)}
          />
          <Trash2
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={(e) => onDelete(e, record._id)}
          />
        </>
      ),
    },
  ];

  const list = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const totalList = data?.pages.flatMap((page) => page.data) ?? [];
    const res =
      totalList.map((record) => ({
        ...record,
        unrealized: Number(
          (
            (((stocksState?.get(record.stockCode)?.now ?? record.buyPrice) -
              record.buyPrice) /
              record.buyPrice) *
            100
          ).toFixed(2),
        ),
        name: stocksState?.get(record.stockCode)?.name,
        percent: (
          (stocksState?.get(record.stockCode)?.percent ?? 0) * 100
        ).toFixed(2),
        price: stocksState?.get(record.stockCode)?.now ?? record.buyPrice,
        high: stocksState?.get(record.stockCode)?.high ?? "N/A",
        low: stocksState?.get(record.stockCode)?.low ?? "N/A",
        yesterday: stocksState?.get(record.stockCode)?.yesterday ?? "N/A",
        totalCost: record.buyPrice * record.unsoldAmount,
        accountName: mapping[record.accountId]?.name,
        up: (stocksState?.get(record.stockCode)?.percent ?? 0) >= 0,
      })) ?? [];
    return res as unknown as BuyRecord[];
  }, [data, isLoading, stocksState, mapping]);

  const onSortChangeHandler = async (sort: Sort, fetchSort?: boolean) => {
    if (fetchSort) {
      setSort({});
    } else {
      setSort(sort);
    }
  };

  const onDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok) {
      removeMutation.mutate({ id });
    }
  };

  const onEdit = (e: React.MouseEvent, buyRecord: BuyRecord) => {
    e.stopPropagation();
    onOpen("editBuyRecord", { buyRecord });
  };

  return (
    <Table
      defaultFilter={{ ..._defaultFilter }}
      data={list}
      loading={isLoading}
      showHeader={showHeader}
      columns={columns}
      dataIndex="_id"
      className="mb-2"
      rowClassName={(item) =>
        cn(
          "group",
          !showHeader && "bg-secondary/80 hover:bg-secondary text-sm",
          showHeader && "p-0",
          recordId === item._id &&
            "outline-dashed outline-1 outline-offset-1 outline-blue-500",
        )
      }
      onRowClick={(_, item) => onSelect(item._id)}
      hasNextPage={hasNextPage}
      loadMore={fetchNextPage}
      onFilterChange={(_filter) => setFilter(_filter)}
      onSortChange={onSortChangeHandler}
      {...props}
    >
      <ConfirmDialog />
    </Table>
  );
};

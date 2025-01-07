import { Column, DataTable } from "@/components/data-table";
import { format } from "date-fns";
import { Link, Loader, Trash2 } from "lucide-react";
import { useDeleteSellRecord } from "../hooks/use-delete-sell-record";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { ResponseType } from "../hooks/use-get-sell-records";
import { BuyRecord, StockInfo } from "@/lib/types";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useGetSellRecords } from "../hooks/use-get-sell-records";
import { useRouter } from "next/navigation";

type SellRecord = ResponseType["data"][0] &
  Omit<BuyRecord, "sellRecords"> &
  StockInfo & {
    up: boolean;
    accountName: string;
    sellPrice: number;
    totalSold: number;
  };
const Table = DataTable<SellRecord>;

export const SellRecordsTable = (props: { style?: React.CSSProperties }) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this record.",
  );

  const router = useRouter();

  const { activeIds, mapping } = useActiveAccounts();
  const { data, isLoading } = useGetSellRecords(activeIds ?? []);

  const columns: Array<Column<SellRecord>> = [
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
    },
    {
      key: "sellPrice",
      label: "Sold Price",
    },
    {
      key: "sellAmount",
      label: "Sold Amount",
    },
    {
      key: "totalSold",
      label: "Total Sold",
      render: ({ totalSold }) => totalSold.toFixed(2),
    },
    {
      key: "profitLoss",
      label: "P&L",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
    },
    {
      key: "apy",
      label: "APY",
      className: ({ up }) =>
        cn(up ? "text-red-500 font-bold" : "text-green-500"),
      render: (item) => `${Number(item.apy).toFixed(2)}%`,
    },
    {
      key: "accountName",
      label: "Account",
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
      className: "flex flex-row gap-4",
      render: (item) => (
        <>
          <Link
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={() => router.push(`buy_record?id=${item.buyRecordId}`)}
          />
          <Trash2
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={(e) => onDelete(e, item._id, item.buyRecordId)}
          />
        </>
      ),
    },
  ];

  const removeMutation = useDeleteSellRecord();

  const onDelete = async (
    e: React.MouseEvent,
    sellRecordId?: string,
    buyRecordId?: string,
  ) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok && buyRecordId && sellRecordId) {
      removeMutation.mutate({
        buyRecordId,
        sellRecordId,
      });
    }
  };

  const { stocksState } = useStocksState();

  const list = useMemo(() => {
    if (data) {
      return data?.map((sellRecord) => {
        const { stockCode, profitLoss, accountId, ...rest } = sellRecord;
        return {
          ...rest,
          stockCode,
          accountId,
          profitLoss,
          totalSold:
            Number(sellRecord.sellPrice) * Number(sellRecord.sellAmount),
          up: Number(profitLoss) >= 0,
          accountName: mapping[accountId]?.name,
          ...(stocksState?.get(stockCode) ?? {}),
        } as unknown as SellRecord;
      });
    }
    return [];
  }, [data, stocksState, mapping]);

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Table
      data={list}
      columns={columns}
      dataIndex="_id"
      className="mb-2"
      rowClassName="group"
      {...props}
    >
      <ConfirmDialog />
    </Table>
  );
};

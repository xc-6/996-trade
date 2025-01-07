import { Column, DataTable } from "@/components/data-table";
import { format } from "date-fns";
import { Loader, Trash2 } from "lucide-react";
import { useDeleteSellRecord } from "../hooks/use-delete-sell-record";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { cn } from "@/lib/utils";
import { usePanel } from "../hooks/use-panel";
import { useGetBuyRecord } from "../hooks/use-get-buy-record";
import { useEffect, useMemo } from "react";
import { useBuyRecordState } from "../store/use-buy-record-store";
import { ResponseType } from "../hooks/use-get-buy-record";
import { BuyRecord, StockInfo } from "@/lib/types";

type SellRecord = ResponseType["data"]["sellRecords"][0] &
  Omit<BuyRecord, "sellRecords"> &
  StockInfo & {
    up: boolean;
  };
const Table = DataTable<SellRecord>;

export const SellRecordTable = (props: { className?: string }) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this record.",
  );

  const { recordId } = usePanel();
  const { setBuyRecord } = useBuyRecordState();
  const {
    data: buyRecord,
    isLoading,
    isSuccess,
  } = useGetBuyRecord(recordId ?? "");

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
      render: (item) =>
        item.sellAmount.toLocaleString("en-US", {
          maximumFractionDigits: 4,
        }),
    },
    {
      key: "unrealized",
      label: "Total Sold",
      render: (item) =>
        (Number(item.sellPrice) * Number(item.sellAmount)).toFixed(2),
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
      key: "sellDate",
      label: "Sold Date",
      render: (item) => format(new Date(item.sellDate), "PPP"),
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (item) => (
        <Trash2
          size={16}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={(e) => onDelete(e, item._id)}
        />
      ),
    },
  ];

  const removeMutation = useDeleteSellRecord();

  useEffect(() => {
    if (isSuccess) {
      setBuyRecord(buyRecord);
    }
  }, [isSuccess, buyRecord, setBuyRecord]);

  const onDelete = async (e: React.MouseEvent, sellRecordId: string) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok && buyRecord?._id) {
      removeMutation.mutate({
        buyRecordId: buyRecord._id,
        sellRecordId,
      });
    }
  };

  const { stocksState } = useStocksState();

  const list = useMemo(() => {
    if (buyRecord) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sellRecords, ..._buyRecord } = buyRecord;
      return buyRecord.sellRecords.map((sellRecord) => {
        const { profitLoss } = sellRecord;
        return {
          ..._buyRecord,
          ...sellRecord,
          ...(stocksState?.get(buyRecord.stockCode) ?? {}),
          profitLoss,
          up: Number(profitLoss) >= 0,
        };
      }) as SellRecord[];
    }
    return [];
  }, [buyRecord, stocksState]);

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

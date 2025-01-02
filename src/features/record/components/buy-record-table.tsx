import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetBuyRecords } from "../hooks/use-get-buy-records";
import { useDeleteBuyRecord } from "../hooks/use-delete-buy-record";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { format } from "date-fns";
import { usePanel } from "../hooks/use-panel";
import { useEffect, useMemo, useState } from "react";
import { Trash2, MoveDown, MoveUp } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { cn, numberFormatter } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { ResponseType } from "../hooks/use-get-buy-records";

type BuyRecord = ResponseType["data"][0];
interface BuyRecordTableProps {
  showHeader?: boolean;
  stockCode?: string;
}
export const BuyRecordTable = ({
  showHeader = true,
  stockCode,
}: BuyRecordTableProps = {}) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this record.",
  );
  const { onSelect, recordId } = usePanel();
  const [sort, setSort] = useState<{
    key?: keyof BuyRecord;
    order?: "asc" | "desc";
  }>({});
  const { stocksState } = useStocksState();
  const { activeIds, mapping } = useActiveAccounts();
  const removeMutation = useDeleteBuyRecord();
  const { data, isLoading, refetch } = useGetBuyRecords(
    activeIds ?? [],
    stockCode,
  );

  const list = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const res =
      data?.map((record) => ({
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

    if (sort.key && sort.order && res.length > 0) {
      if (typeof res[0]?.[sort.key] === "string") {
        res.sort((a, b) => {
          if (sort.order === "asc") {
            return a[sort.key].localeCompare(b[sort.key]);
          } else {
            return b[sort.key].localeCompare(a[sort.key]);
          }
        });
      } else {
        res.sort((a, b) => {
          if (sort.order === "asc") {
            return a[sort.key] < b[sort.key] ? -1 : 1;
          } else {
            return a[sort.key] > b[sort.key] ? -1 : 1;
          }
        });
      }
    }
    return res;
  }, [data, isLoading, sort, stocksState, mapping]);

  useEffect(() => {
    refetch();
  }, [activeIds, refetch]);

  const onDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok) {
      removeMutation.mutate({ id });
    }
  };

  const onSort = (key: string) => {
    if (sort.key === key) {
      setSort((prev) => ({
        ...prev,
        order: prev.order === "asc" ? "desc" : "asc",
      }));
    } else {
      setSort({ key, order: "asc" });
    }
  };

  const renderRows = () => (
    <>
      <ConfirmDialog />
      {list?.map((record) => (
        <TableRow
          className={cn(
            "group",
            !showHeader && "bg-secondary/80 hover:bg-secondary text-sm",
            recordId === record._id &&
              "outline-dashed outline-1 outline-offset-1 outline-blue-500",
          )}
          key={record._id}
          onClick={() => {
            onSelect(record._id);
          }}
        >
          <TableCell className="font-medium">
            <Badge variant="outline" className="mr-2">
              {record.stockCode.slice(0, 2)}
            </Badge>
            {record.stockCode.slice(2)}
          </TableCell>
          <TableCell className="font-medium">
            {stocksState?.get(record.stockCode)?.name}
          </TableCell>

          <TableCell // Price
            className={cn(
              "text-nowrap",
              record.percent >= 0 ? "text-red-500 font-bold" : "text-green-500",
            )}
          >
            {record.percent >= 0 ? (
              <MoveUp size={16} className="inline" />
            ) : (
              <MoveDown size={16} className="inline" />
            )}
            {record.price}
          </TableCell>

          <TableCell // Cost
          >
            {record.buyPrice}
          </TableCell>

          <TableCell // Unrealized P&L
            className={cn(
              "text-sm",
              record.buyPrice <= record.price
                ? "text-red-500 font-bold"
                : "text-green-500",
            )}
          >
            {numberFormatter(
              (record.price - record.buyPrice) * record.unsoldAmount,
            )}
            <span className="text-sm">({record.unrealized}%)</span>
          </TableCell>

          <TableCell // TPC
            className={cn(
              record.up ? "text-red-500 font-bold" : "text-green-500",
            )}
          >
            {showHeader && `${record.percent} %`}
          </TableCell>
          <TableCell // High
            className={cn(
              record.up ? "text-red-500 font-bold" : "text-green-500",
            )}
          >
            {showHeader && record.high}
          </TableCell>
          <TableCell // Low
            className={cn(
              record.up ? "text-red-500 font-bold" : "text-green-500",
            )}
          >
            {showHeader && record.low}
          </TableCell>
          <TableCell // Yesterday
            className={cn(
              record.up ? "text-red-500 font-bold" : "text-green-500",
            )}
          >
            {showHeader && record.yesterday}
          </TableCell>

          <TableCell>{numberFormatter(record.totalCost)}</TableCell>
          <TableCell>{numberFormatter(record.unsoldAmount)}</TableCell>
          <TableCell>{numberFormatter(record.buyAmount)}</TableCell>

          <TableCell>{numberFormatter(record.profitLoss)}</TableCell>

          <TableCell>{record.accountName}</TableCell>
          <TableCell>{format(new Date(record.buyDate), "PPP")}</TableCell>
          <TableCell>
            <Trash2
              size={16}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              onClick={(e) => onDelete(e, record._id)}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  const renderHeader = (name, key) => (
    <TableHead className="text-nowrap" onClick={() => onSort(key)}>
      <span className={cn(sort.key === key && "font-bold text-blue-500")}>
        {name}
      </span>
      <div className="inline-flex flex-col align-middle ml-1">
        <ChevronUp
          size={12}
          className={cn(
            "cursor-pointer",
            sort.key === key && sort.order === "asc"
              ? "stroke-blue-500 fill-blue-500"
              : "",
          )}
        />
        <ChevronDown
          size={12}
          className={cn(
            "cursor-pointer",
            sort.key === key && sort.order === "desc"
              ? "stroke-blue-500 fill-blue-500"
              : "",
          )}
        />
      </div>
    </TableHead>
  );

  if (isLoading && showHeader) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!showHeader) {
    return renderRows();
  }

  return (
    <Table className="m-4">
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          {renderHeader("Code", "stockCode")}
          {renderHeader("Name", "name")}
          {renderHeader("Price", "price")}
          {renderHeader("Cost", "buyPrice")}
          {renderHeader("Unrealized P&L", "unrealized")}

          {renderHeader("TPC", "percent")}
          {renderHeader("High", "high")}
          {renderHeader("Low", "low")}
          {renderHeader("Yesterday", "yesterday")}

          {renderHeader("Total Cost", "totalCost")}
          {renderHeader("Unsold Amount", "unsoldAmount")}
          {renderHeader("Buy Amount", "buyAmount")}

          {renderHeader("Realized P&L", "profitLoss")}
          {renderHeader("Account", "accountName")}
          {renderHeader("Buy Date", "buyDate")}
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{renderRows()}</TableBody>
    </Table>
  );
};

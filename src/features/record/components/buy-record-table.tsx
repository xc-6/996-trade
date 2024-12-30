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
import { Loader } from "lucide-react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { format } from "date-fns";
import { usePanel } from "../hooks/use-panel";
import { useEffect, useReducer } from "react";
import { Trash2, MoveDown, MoveUp } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { cn, numberFormatter } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
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
  const { stocksState } = useStocksState();
  const { activeIds, mapping } = useActiveAccounts();
  const removeMutation = useDeleteBuyRecord();
  const { data, isLoading, refetch } = useGetBuyRecords(
    activeIds ?? [],
    stockCode,
  );

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

  const renderRows = () => (
    <>
      <ConfirmDialog />
      {data?.map((record) => (
        <TableRow
          className={cn(
            "group",
            !showHeader && "bg-secondary/80 hover:bg-secondary text-sm",
            recordId === record._id && "bg-secondary",
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
          <TableCell
            className={cn(
              record.buyPrice <=
                (stocksState?.get(record.stockCode)?.now ?? record.buyPrice)
                ? "text-red-500 font-bold"
                : "text-green-500",
            )}
          >
            {record.buyPrice <=
            (stocksState?.get(record.stockCode)?.now ?? record.buyPrice) ? (
              <MoveUp size={16} className="inline" />
            ) : (
              <MoveDown size={16} className="inline" />
            )}
            {stocksState?.get(record.stockCode)?.now} | {record.buyPrice} |{" "}
            <span className="text-sm">
              {numberFormatter(
                ((stocksState?.get(record.stockCode)?.now ?? record.buyPrice) -
                  record.buyPrice) *
                  record.unsoldAmount,
              )}
            </span>{" "}
            <span className="text-sm">
              (
              {(
                (((stocksState?.get(record.stockCode)?.now ?? record.buyPrice) -
                  record.buyPrice) /
                  record.buyPrice) *
                100
              ).toFixed(2)}
              %)
            </span>
          </TableCell>
          <TableCell
            className={cn(
              (stocksState?.get(record.stockCode)?.percent ?? 0) >= 0
                ? "text-red-500 font-bold"
                : "text-green-500",
            )}
          >
            {showHeader &&
              `${(
                (stocksState?.get(record.stockCode)?.percent ?? 0) * 100
              ).toFixed(
                2,
              )} % | ${stocksState?.get(record.stockCode)?.high ?? "N/A"} |
            ${stocksState?.get(record.stockCode)?.low ?? "N/A"} |
            ${stocksState?.get(record.stockCode)?.yesterday ?? "N/A"}`}
          </TableCell>
          <TableCell>
            {numberFormatter(record.buyPrice * record.unsoldAmount)} |{" "}
            {numberFormatter(record.unsoldAmount)} |{" "}
            {numberFormatter(record.buyAmount)}
          </TableCell>

          <TableCell>{numberFormatter(record.profitLoss)}</TableCell>

          <TableCell>{mapping[record.accountId]?.name}</TableCell>
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
          <TableHead className="w-[10%]">Code</TableHead>
          <TableHead className="w-[10%]">Name</TableHead>
          <TableHead className="w-[20%]">
            Price | Cost | Unrealized P&L
          </TableHead>
          <TableHead className="w-[20%]">
            TPC | High | Low | Yesterday
          </TableHead>
          <TableHead className="w-[20%]">
            Total Cost | Unsold Amount | Buy Amount
          </TableHead>
          <TableHead className="w-[5%]">Realized P&L</TableHead>
          <TableHead className="w-[5%]">Account</TableHead>
          <TableHead className="w-[10%]">Buy Date</TableHead>
          <TableHead className="w-[1%]">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{renderRows()}</TableBody>
    </Table>
  );
};

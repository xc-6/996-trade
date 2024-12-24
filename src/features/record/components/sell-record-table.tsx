import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader, Trash2 } from "lucide-react";
import { useDeleteSellRecord } from "../hooks/use-delete-sell-record";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { cn } from "@/lib/utils";
import { usePanel } from "../hooks/use-panel";
import { useGetBuyRecord } from "../hooks/use-get-buy-record";
import { useEffect } from "react";
import { useBuyRecordState } from "../store/use-buy-record-store";

export const SellRecordTable = () => {
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

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Table className="m-4">
      <ConfirmDialog />
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Sell Price</TableHead>
          <TableHead>Sell Amount</TableHead>
          <TableHead>Sell Total</TableHead>
          <TableHead>P&L</TableHead>
          <TableHead>APY</TableHead>
          <TableHead>Sell Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buyRecord?.sellRecords?.map((record) => {
          const profitLoss =
            (Number(record.sellPrice) - Number(buyRecord.buyPrice)) *
            Number(record.sellAmount);
          const initialInvestment =
            Number(buyRecord.buyPrice) * Number(record.sellAmount);
          const holdingDays = Math.ceil(
            (new Date(record.sellDate).getTime() -
              new Date(buyRecord.buyDate).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          const profitRatio = profitLoss / initialInvestment;
          const apy = (Math.pow(1 + profitRatio, 365 / holdingDays) - 1) * 100;

          return (
            <TableRow className="group" key={record._id}>
              <TableCell className="font-medium">
                <Badge variant="outline" className="mr-2">
                  {buyRecord.stockCode.slice(0, 2)}
                </Badge>
                {buyRecord.stockCode.slice(2)}
              </TableCell>
              <TableCell className="font-medium">
                {stocksState?.get(buyRecord.stockCode)?.name}
              </TableCell>
              <TableCell>{record.sellPrice}</TableCell>
              <TableCell>{record.sellAmount}</TableCell>
              <TableCell>
                {(Number(record.sellPrice) * Number(record.sellAmount)).toFixed(
                  2,
                )}
              </TableCell>
              <TableCell
                className={cn(
                  profitLoss > 0 ? "text-red-500 font-bold" : "text-green-500",
                )}
              >
                {profitLoss.toFixed(2)}
              </TableCell>

              <TableCell
                className={cn(
                  profitLoss > 0 ? "text-red-500 font-bold" : "text-green-500",
                )}
              >
                {`${apy.toFixed(2)}%`}
              </TableCell>

              <TableCell>{format(new Date(record.sellDate), "PPP")}</TableCell>
              <TableCell>
                <Trash2
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={(e) => onDelete(e, record._id)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      {/* <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter> */}
    </Table>
  );
};

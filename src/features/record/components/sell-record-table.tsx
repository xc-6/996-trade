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
  import { useBuyRecordState } from "../store/use-buy-record-store";
import { Badge } from "@/components/ui/badge";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { cn } from "@/lib/utils";

  export const SellRecordTable = () => {
    const { buyRecord } = useBuyRecordState()
    const { stocksState } = useStocksState()
    return (
      <Table className="m-4">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyRecord?.sellRecords?.map((record) => {
            const profitLoss = ((Number(record.sellPrice) - Number(buyRecord.buyPrice)) * Number(record.sellAmount));
            const initialInvestment = Number(buyRecord.buyPrice) * Number(record.sellAmount);
            const holdingDays = Math.ceil((new Date(record.sellDate).getTime() - new Date(buyRecord.buyDate).getTime()) / (1000 * 60 * 60 * 24));
            const profitRatio = profitLoss / initialInvestment;
            const apy = (Math.pow(1 + profitRatio, 365 / holdingDays) - 1) * 100;

            return (
              <TableRow key={record._id}>
                <TableCell className="font-medium">
                  <Badge variant="outline" className="mr-2">{buyRecord.stockCode.slice(0, 2)}</Badge>
                  {buyRecord.stockCode.slice(2)}
                </TableCell>
                <TableCell className="font-medium">{stocksState?.get(buyRecord.stockCode)?.name}</TableCell>
                <TableCell>{record.sellPrice}</TableCell>
                <TableCell>{record.sellAmount}</TableCell>
                <TableCell>{(Number(record.sellPrice) * Number(record.sellAmount)).toFixed(2)}</TableCell>
                <TableCell
                  className={cn(
                    profitLoss > 0
                      ? "text-red-500 font-bold"
                      : "text-green-500"
                  )}
                >
                  {profitLoss.toFixed(2)}
                </TableCell>

                <TableCell
                  className={cn(
                    profitLoss > 0
                      ? "text-red-500 font-bold"
                      : "text-green-500"
                  )}
                >
                  {`${apy.toFixed(2)}%`}
                </TableCell>

                <TableCell>{format(new Date(record.sellDate), "PPP")}</TableCell>
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

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
import { useGetRecordsByStock } from "../hooks/use-get-records-by-stock";
import { Loader } from "lucide-react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { BuyRecordTable } from "./buy-record-table";
import { cn, numberFormatter } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { Fragment, useEffect, useState } from "react";
import { MoveDown, MoveUp } from "lucide-react";

export const StockRecordTable = () => {
  const [selected, setSelected] = useState(new Set<string>());
  const { stocksState } = useStocksState();
  const { activeIds } = useActiveAccounts();
  const { data, isLoading, refetch } = useGetRecordsByStock(activeIds ?? []);

  const onSelect = (stockCode: string) => {
    setSelected((prev) => {
      const s = new Set([...prev]);
      if (s.has(stockCode)) {
        s.delete(stockCode);
      } else {
        s.add(stockCode);
      }
      return s;
    });
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
    <Table className="m-4">
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Code</TableHead>
          <TableHead className="w-[20%]">Name</TableHead>
          <TableHead>Price | Cost | Unrealized P&L </TableHead>
          <TableHead>TPC | High | Low | Yesterday</TableHead>
          <TableHead>Total Cost | Unsold Amount | Buy Amount</TableHead>
          <TableHead>Realized P&L</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Buy Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody key="table">
        {Object.keys(data ?? {})?.map((stockCode) => (
          <Fragment key={stockCode}>
            <TableRow
              className="group"
              onClick={() => {
                onSelect(stockCode);
              }}
            >
              <TableCell className="font-medium">
                <Badge variant="outline" className="mr-2">
                  {stockCode.slice(0, 2)}
                </Badge>
                {stockCode.slice(2)}
              </TableCell>
              <TableCell className="font-medium">
                {stocksState?.get(stockCode)?.name}
              </TableCell>
              <TableCell
                className={cn(
                  data?.[stockCode]?.avgCost !== undefined &&
                    data?.[stockCode]?.avgCost <=
                      (stocksState?.get(stockCode)?.now ??
                        data?.[stockCode]?.avgCost)
                    ? "text-red-500 font-bold"
                    : "text-green-500",
                )}
              >
                {data?.[stockCode]?.avgCost !== undefined &&
                data?.[stockCode]?.avgCost <=
                  (stocksState?.get(stockCode)?.now ??
                    data?.[stockCode]?.avgCost) ? (
                  <MoveUp size={16} className="inline" />
                ) : (
                  <MoveDown size={16} className="inline" />
                )}
                {stocksState?.get(stockCode)?.now} |{" "}
                {data?.[stockCode]?.avgCost} |
                <span className="text-sm">
                  {new Intl.NumberFormat().format(
                    data?.[stockCode]?.totalPL ?? 0,
                  )}
                </span>
                <span className="text-sm">
                  (
                  {(
                    (((stocksState?.get(stockCode)?.now ??
                      data?.[stockCode]?.avgCost ??
                      0) -
                      (data?.[stockCode]?.avgCost ?? 0)) /
                      (data?.[stockCode]?.avgCost ?? 1)) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              </TableCell>
              <TableCell
                className={cn(
                  (stocksState?.get(stockCode)?.percent ?? 0) >= 0
                    ? "text-red-500 font-bold"
                    : "text-green-500",
                )}
              >
                {((stocksState?.get(stockCode)?.percent ?? 0) * 100).toFixed(2)}{" "}
                % | {stocksState?.get(stockCode)?.high ?? "N/A"} |
                {stocksState?.get(stockCode)?.low ?? "N/A"} |
                {stocksState?.get(stockCode)?.yesterday ?? "N/A"}
              </TableCell>
              <TableCell>
                {numberFormatter(data?.[stockCode]?.totalCost)} |{" "}
                {numberFormatter(data?.[stockCode]?.totalUnsoldAmount)} |{" "}
                {numberFormatter(data?.[stockCode]?.totalBuyAmount)}{" "}
              </TableCell>
              <TableCell>
                {numberFormatter(data?.[stockCode]?.totalPL)}
              </TableCell>
            </TableRow>
            {selected.has(stockCode) && (
              <BuyRecordTable
                showHeader={false}
                stockCode={stockCode}
                key={`${stockCode}-table`}
              />
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

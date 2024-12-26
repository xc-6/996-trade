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
import { cn } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { Fragment, useEffect, useState } from "react";
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
      <TableCaption>
        A list of your recent transactions. {selected.size}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Code</TableHead>
          <TableHead className="w-[20%]">Name</TableHead>
          <TableHead>Current Price | Buy Price | P&L</TableHead>
          <TableHead>High | Low | Yest</TableHead>
          <TableHead>Buy Amount</TableHead>
          <TableHead>Unsold Amount</TableHead>
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
              <TableCell>
                {stocksState?.get(stockCode)?.now}
                <span className="text-sm"></span>
              </TableCell>
              <TableCell>
                {stocksState?.get(stockCode)?.high} |{" "}
                {stocksState?.get(stockCode)?.low} |{" "}
                {stocksState?.get(stockCode)?.yesterday}
              </TableCell>
              <TableCell>{data?.[stockCode]?.totalBuyAmount}</TableCell>
              <TableCell>{data?.[stockCode]?.totalUnsoldAmount}</TableCell>
              <TableCell>{data?.[stockCode]?.totalCost}</TableCell>
              <TableCell>{data?.[stockCode]?.totalPL}</TableCell>
              <TableCell>{data?.[stockCode]?.avgCost}</TableCell>
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

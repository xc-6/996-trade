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
import { useConfirm } from "@/hooks/use-confirm";
import { useGetRecordsByStock } from "../hooks/use-get-records-by-stock";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { BuyRecordTable } from "./buy-record-table";
import { cn, numberFormatter } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Trash2, MoveDown, MoveUp } from "lucide-react";
import { ResponseType } from "../hooks/use-get-records-by-stock";
import { useDeleteStockGroups } from "../hooks/use-delete-stock-groups";

export const StockRecordTable = () => {
  const [selected, setSelected] = useState(new Set<string>());
  const { stocksState } = useStocksState();
  const { activeIds } = useActiveAccounts();
  const { data, isLoading, refetch } = useGetRecordsByStock(activeIds ?? []);
  const removeMutation = useDeleteStockGroups();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this record.",
  );

  type StockRecord = ResponseType["data"][0];

  const onSort = (key: keyof StockRecord) => {
    if (sort.key === key) {
      setSort((prev) => ({
        ...prev,
        order: prev.order === "asc" ? "desc" : "asc",
      }));
    } else {
      setSort({ key, order: "asc" });
    }
  };

  const [sort, setSort] = useState<{
    key?: keyof StockRecord;
    order?: "asc" | "desc";
  }>({});

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
      const unrealizedPL = numberFormatter(
        (record?.totalUnsoldAmount ?? 0) * price - (record?.totalCost ?? 0),
      );
      const high = stocksState?.get(stockCode)?.high ?? "N/A";
      const low = stocksState?.get(stockCode)?.low ?? "N/A";
      const yesterday = stocksState?.get(stockCode)?.yesterday ?? "N/A";
      const totalCost = buyPrice * (record?.totalUnsoldAmount ?? 0);
      const totalPL = record?.totalPL ?? 0;
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
        totalCost,
        totalPL,
        up,
      };
    });

    if (sort.key && sort.order && res.length > 0) {
      if (typeof res[0]?.[sort.key] === "string") {
        res.sort((a, b) => {
          if (sort.order === "asc") {
            return String(a[sort.key!]).localeCompare(String(b[sort.key!]));
          } else {
            return String(b[sort.key!]).localeCompare(String(a[sort.key!]));
          }
        });
      } else {
        res.sort((a, b) => {
          if (sort.order === "asc") {
            return a[sort.key!]! < b[sort.key!]! ? -1 : 1;
          } else {
            return a[sort.key!]! > b[sort.key!]! ? -1 : 1;
          }
        });
      }
    }

    return res;
  }, [isLoading, data, sort, stocksState]);

  const renderHeader = (name: string, key: string) => (
    <TableHead
      className="text-nowrap"
      onClick={() => onSort(key as keyof StockRecord)}
    >
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

  const onDelete = async (e: React.MouseEvent, stockCode: string) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok) {
      removeMutation.mutate({ stockCode });
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
    <Table className="m-4">
      <ConfirmDialog />
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Code</TableHead>
          <TableHead className="w-[20%]">Name</TableHead>

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

          <TableHead>Account</TableHead>
          <TableHead>Buy Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody key="table">
        {list?.map((record) => (
          <Fragment key={record.stockCode}>
            <TableRow
              className={cn("group")}
              onClick={() => {
                onSelect(record.stockCode);
              }}
            >
              <TableCell className="font-medium">
                <Badge variant="outline" className="mr-2">
                  {record.stockCode.slice(0, 2)}
                </Badge>
                {record.stockCode.slice(2)}
              </TableCell>
              <TableCell className="font-medium">{record.name}</TableCell>

              <TableCell // Price
                className={cn(
                  record.up ? "text-red-500 font-bold" : "text-green-500",
                )}
              >
                {record.up ? (
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
                  parseFloat(record.unrealized) > 0
                    ? "text-red-500 font-bold"
                    : "text-green-500",
                )}
              >
                {record.unrealized}
              </TableCell>

              <TableCell // TPC
                className={cn(
                  record.up ? "text-red-500 font-bold" : "text-green-500",
                )}
              >
                {record.percent}%
              </TableCell>
              <TableCell // High
                className={cn(
                  record.up ? "text-red-500 font-bold" : "text-green-500",
                )}
              >
                {record.high}
              </TableCell>
              <TableCell // Low
                className={cn(
                  record.up ? "text-red-500 font-bold" : "text-green-500",
                )}
              >
                {record.low}
              </TableCell>
              <TableCell // Yesterday
                className={cn(
                  record.up ? "text-red-500 font-bold" : "text-green-500",
                )}
              >
                {record.yesterday}
              </TableCell>

              <TableCell>{numberFormatter(record.totalCost)}</TableCell>
              <TableCell>{numberFormatter(record.totalUnsoldAmount)}</TableCell>
              <TableCell>{numberFormatter(record.totalBuyAmount)}</TableCell>

              <TableCell>{numberFormatter(record.totalPL)}</TableCell>

              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Trash2
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={(e) => onDelete(e, record.stockCode)}
                />
              </TableCell>
            </TableRow>
            {selected.has(record.stockCode) && (
              <BuyRecordTable
                showHeader={false}
                stockCode={record.stockCode}
                key={`${record.stockCode}-table`}
              />
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

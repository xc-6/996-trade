"use client";
import { Column, DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { DivBatchesTable } from "./div-batches-table";
import { cn } from "@/lib/utils";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { useEffect, useMemo } from "react";
import { totalUnsoldAmount } from "../deafult";
import { StockInfo } from "@/lib/types";
import { useGetDivStockcodes } from "../hooks/use-get-div-stockcodes";

type Data = StockInfo;
const Table = DataTable<Data>;
export const StockDivBatchesTable = (props: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { stocksState } = useStocksState();
  const { activeIds } = useActiveAccounts();
  const {
    data: stockCodes,
    refetch,
    isLoading,
  } = useGetDivStockcodes(activeIds ?? []);

  const columns: Array<Column<Data>> = [
    {
      key: "expand",
      label: "",
      type: "expand",
      className: "w-[20px]",
      render: (item) => {
        return (
          <DivBatchesTable stockCode={item.code} key={`${item.code}-table`} />
        );
      },
      sortable: false,
    },
    {
      key: "code",
      label: "Code",
      render: (item) => {
        return (
          <>
            <Badge variant="outline" className="mr-2">
              {item.code.slice(0, 2)}
            </Badge>
            {item.code.slice(2)}
          </>
        );
      },
      sortable: "local",
    },
    {
      key: "name",
      label: "Name",
      className: "font-medium",
      render: (item) => item.name ?? "N/A",
      sortable: "local",
    },
    {
      key: "perDiv",
      label: "Dividend Per Share",
      sortable: false,
    },
    {
      key: "divDate",
      label: "Dividend Date",
      sortable: false,
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: () => <></>,
    },
  ];

  const list = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const res = stockCodes?.map((code) => {
      const info = stocksState?.get(code);
      return {
        ...info,
        code,
      } as Data;
    });

    return res as unknown as Data[];
  }, [isLoading, stockCodes, stocksState]);

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
    <Table
      defaultFilter={{ totalUnsoldAmount }}
      data={list}
      columns={columns}
      dataIndex="code"
      className="mb-2"
      rowClassName={cn("group")}
      {...props}
    ></Table>
  );
};

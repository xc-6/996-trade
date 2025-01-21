"use client";
import { Column, DataTable } from "@/components/data-table";
import { format } from "date-fns";
import { Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { usePanel } from "../hooks/use-panel";
import { useGetDivRecords, ResponseType } from "../hooks/use-get-div-records";
import { StockInfo } from "@/lib/types";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { useRouter } from "next/navigation";

type DivRecord = ResponseType["data"][0] &
  StockInfo & {
    total: number;
  };
const Table = DataTable<DivRecord>;

interface DivRecordTableProps {
  style?: React.CSSProperties;
}

export const DivRecordTable = (props: DivRecordTableProps) => {
  const router = useRouter();
  const { id: buyRecordId } = usePanel();
  const { stocksState } = useStocksState();
  const { data, isLoading } = useGetDivRecords(buyRecordId ?? "");

  const columns: Array<Column<DivRecord>> = [
    {
      key: "placeholder",
      label: "",
      className: "w-[20px]",
      sortable: false,
    },
    {
      key: "code",
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
      key: "divAmount",
      label: "Amount",
    },
    {
      key: "total",
      label: "Total",
    },
    {
      key: "divDate",
      label: "Dividend Date",
      render: (item) => format(new Date(item.divDate), "PPP"),
      sortable: false,
    },

    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (item) => (
        <>
          <Link
            size={16}
            className="cursor-pointer"
            onClick={() => {
              router.push(`/div_record?id=${item.batchId}`);
            }}
          />
        </>
      ),
    },
  ];

  const list = useMemo(() => {
    if (isLoading) {
      return [];
    }
    if (data) {
      const res = data.map((item) => {
        const info = stocksState.get(item.stockCode);
        const total = item.perDiv * item.divAmount;
        return {
          ...item,
          ...info,
          total,
        };
      }) as unknown as DivRecord[];
      return res;
    }
    return [];
  }, [data, isLoading, stocksState]);

  return (
    <Table
      data={list}
      loading={isLoading}
      columns={columns}
      dataIndex="batchId"
      className={cn(list.length == 0 && "min-h-[40vh]")}
      rowClassName={cn("group")}
      {...props}
    ></Table>
  );
};

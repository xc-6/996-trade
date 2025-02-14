"use client";
import { Column, DataTable } from "@/components/data-table";
import { format } from "date-fns";
import { Link } from "lucide-react";
import { cn, numberFormatter } from "@/lib/utils";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { usePanel } from "../hooks/use-panel";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useGetDivBatch } from "../hooks/use-get-div-batch";
import { ResponseType } from "../hooks/use-get-div-batch";
import { StockInfo } from "@/lib/types";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { useRouter } from "next/navigation";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";

type DivRecord = ResponseType["data"]["list"][0] &
  ResponseType["data"] &
  StockInfo & {
    total: number;
  };
const Table = DataTable<DivRecord>;

interface DivBatchTableProps {
  style?: React.CSSProperties;
}

export const DivBatchTable = (props: DivBatchTableProps) => {
  const { id: batchId } = usePanel();
  const { stocksState } = useStocksState();
  const router = useRouter();
  const { mapping } = useActiveAccounts();

  const { data, isLoading } = useGetDivBatch(batchId ?? "");

  const columns: Array<Column<DivRecord>> = [
    {
      key: "code",
      label: "Code",
      render: (item) => {
        return (
          <>
            <Badge variant="outline" className="mr-2">
              {item?.code?.slice(0, 2)}
            </Badge>
            {item?.code?.slice(2)}
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
      className: "text-center",
    },
    {
      key: "divAmount",
      label: "Amount",
      sortable: false,
      render: (item) => item?.divAmount ?? "N/A",
    },
    {
      key: "total",
      label: "Dividen Total",
      sortable: false,
      render: (item) => item?.total.toFixed(2) ?? "N/A",
    },
    {
      key: "buyPrice",
      label: "Buy Price",
      render: (item) => item?.buyPrice ?? "N/A",
      sortable: false,
    },
    {
      key: "divDate",
      label: "Dividend Date",
      render: (item) => format(new Date(item.divDate), "PPP"),
      sortable: false,
    },
    {
      key: "accountName",
      label: "Account Name",
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
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={() => {
              router.push(`/buy_record?id=${item.buyRecordId}`);
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
      const { list, ...rest } = data;
      const { stockCode, perDiv } = rest;
      const res = list?.map((item) => {
        const info = stocksState.get(stockCode);
        const accountName = mapping[item.accountId]?.name;
        const total = item.divAmount * perDiv;
        return {
          ...rest,
          ...item,
          ...info,
          total,
          accountName,
        };
      }) as unknown as DivRecord[];
      return res;
    }
    return [];
  }, [data, isLoading, stocksState, mapping]);

  const totalDiv = useMemo(() => {
    return list.reduce((acc, cur) => acc + cur.total, 0);
  }, [list]);

  const renderFooter = () => (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={4}>Total Dividen</TableCell>
        <TableCell colSpan={1} className="text-left font-bold">
          {numberFormatter(totalDiv)}
        </TableCell>
        <TableCell colSpan={4} />
      </TableRow>
    </TableFooter>
  );

  return (
    <Table
      data={list}
      loading={isLoading}
      columns={columns}
      dataIndex="_id"
      className={cn(list.length == 0 && "min-h-[40vh]")}
      rowClassName={(item) =>
        cn(
          "group",
          batchId === item._id &&
            "outline-dashed outline-1 outline-offset-1 outline-blue-500",
        )
      }
      renderFooter={renderFooter}
      {...props}
    ></Table>
  );
};

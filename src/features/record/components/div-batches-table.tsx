"use client";
import { Column, DataTable } from "@/components/data-table";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { usePanel } from "../hooks/use-panel";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useGetDivBatches, ResponseType } from "../hooks/use-get-div-batches";
import { useDeleteDivBatch } from "../hooks/use-delete-div-batch";
import { StockInfo } from "@/lib/types";
import { useConfirm } from "@/hooks/use-confirm";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { useModal } from "@/hooks/use-modal-store";

type BatchRecord = ResponseType["data"][0] & StockInfo;
const Table = DataTable<BatchRecord>;

interface StockDivBatchTableProps {
  style?: React.CSSProperties;
  stockCode: string;
}

export const DivBatchesTable = (props: StockDivBatchTableProps) => {
  const { stockCode } = props;
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this record.",
  );
  const { onOpen } = useModal();
  const { id: batchId, onSelect } = usePanel();
  const { stocksState } = useStocksState();
  const { activeIds } = useActiveAccounts();

  const { data, isLoading } = useGetDivBatches(activeIds ?? [], stockCode);
  const removeMutation = useDeleteDivBatch();

  const onDelete = async (e: React.MouseEvent, batchId: string) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok && batchId) {
      removeMutation.mutate({ batchId });
    }
  };

  const columns: Array<Column<BatchRecord>> = [
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
              {item.code?.slice(0, 2)}
            </Badge>
            {item.code?.slice(2)}
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
      render: (item) => format(new Date(item.divDate), "PPP"),
      sortable: false,
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      className: "flex flex-row gap-2 items-center",
      render: (item) => (
        <>
          <Pencil
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onOpen("editDivBatch", { divBatch: item });
            }}
          />
          <Trash2
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={(e) => onDelete(e, item._id)}
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
        return {
          ...item,
          ...info,
        };
      }) as BatchRecord[];
      return res;
    }
    return [];
  }, [data, isLoading, stocksState]);

  return (
    <Table
      data={list}
      loading={isLoading}
      columns={columns}
      dataIndex="_id"
      className={cn(list.length == 0 && "min-h-[40vh]")}
      showHeader={false}
      rowClassName={(item) =>
        cn(
          "group",
          batchId === item._id &&
            "outline-dashed outline-1 outline-offset-1 outline-blue-500",
          "bg-secondary/80 hover:bg-secondary text-sm",
        )
      }
      onRowClick={(_, item) => onSelect(item._id)}
      {...props}
    >
      <ConfirmDialog />
    </Table>
  );
};

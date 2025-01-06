import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Fragment, JSX, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string | ((row: T) => string);
  type?: "expand" | "text";
}
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  dataIndex: keyof T;
  className?: string;
  rowClassName?: string | ((row: T) => string);
  showHeader?: boolean;
  onSort?: (key: keyof T, direction: "asc" | "desc") => void;
  defaultFilter?: Record<string, { min?: number; max?: number }>;
  children?: JSX.Element;
  onRowClick?: (e: React.MouseEvent, row: T) => void;
}
export const DataTable = <T,>(props: DataTableProps<T>) => {
  const {
    columns,
    data,
    className,
    rowClassName,
    dataIndex,
    showHeader = true,
    children,
    onRowClick,
    defaultFilter = {},
  } = props;
  const [expanedSet, setExpanedSet] = useState(new Set<string>());
  const [sort, setSort] = useState<{
    key?: keyof T;
    order?: "asc" | "desc";
  }>({});
  const [filter, setFilter] = useState<
    Record<
      string,
      {
        min?: number;
        max?: number;
      }
    >
  >({ ...defaultFilter });
  const [tmpFilter, setTmpFilter] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [filterActive, setFilterActive] = useState("");
  const mapping = useMemo(() => {
    return columns.reduce(
      (acc, col) => {
        if (col.key) {
          acc[col.key] = col;
        }
        return acc;
      },
      {} as Record<string, Column<T>>,
    );
  }, [columns]);
  const keys = useMemo(() => {
    return columns.map((col) => {
      return col.key;
    });
  }, [columns]);

  const list = useMemo(() => {
    const res = data.filter((record) => {
      for (const key in filter) {
        if (
          (filter[key].min !== undefined &&
            Number(record[key as keyof T]) < filter[key].min) ||
          (filter[key].max !== undefined &&
            Number(record[key as keyof T]) > filter[key].max)
        ) {
          return false;
        }
      }
      return true;
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
            return a[sort.key!] < b[sort.key!] ? -1 : 1;
          } else {
            return a[sort.key!] > b[sort.key!] ? -1 : 1;
          }
        });
      }
    }
    return res;
  }, [data, sort, filter]);

  const onSort = (key: keyof T) => {
    if (sort.key === key) {
      setSort((prev) => ({
        ...prev,
        order: prev.order === "asc" ? "desc" : "asc",
      }));
    } else {
      setSort({ key, order: "asc" });
    }
  };

  const onOpenChange = (open: boolean, key: string) => {
    if (open) {
      setTmpFilter(filter[key]);
      setFilterActive(key);
    } else {
      setFilterActive("");
      setTmpFilter({});
    }
  };

  const _onRowClick = (e: React.MouseEvent, item: T) => {
    onRowClick?.(e, item);
    if (mapping.expand?.type === "expand") {
      if (expanedSet.has(String(item?.[dataIndex]))) {
        remove(String(item?.[dataIndex]));
      } else {
        add(String(item?.[dataIndex]));
      }
    }
  };

  const remove = (id: string) => {
    setExpanedSet((prev) => {
      const _set = new Set(prev);
      _set.delete(id);
      return _set;
    });
  };

  const add = (id: string) => {
    setExpanedSet((prev) => {
      const _set = new Set(prev);
      _set.add(id);
      return _set;
    });
  };

  const renderRows = () => (
    <>
      {list?.map((item, idx) => (
        <Fragment key={String(item?.[dataIndex])}>
          <TableRow
            className={
              typeof rowClassName === "string"
                ? rowClassName
                : rowClassName?.(item)
            }
            onClick={(e) => _onRowClick?.(e, item)}
          >
            {keys.map((key) => {
              const className =
                typeof mapping[key].className === "string"
                  ? mapping[key].className
                  : (mapping[key].className?.(item) ?? "");
              const type = mapping[key].type ?? "text";
              const content = item[key as keyof T];
              return (
                <TableCell key={`${String(key)}-${idx}`} className={className}>
                  {type === "expand" &&
                    (expanedSet.has(String(item?.[dataIndex])) ? (
                      <ChevronDown size="14" />
                    ) : (
                      <ChevronRight size="14" />
                    ))}
                  {(type === "text" && mapping[key].render?.(item)) ??
                    (content ? String(content) : "")}
                </TableCell>
              );
            })}
          </TableRow>
          {expanedSet.has(String(item?.[dataIndex])) && (
            // <TableRow>
            //   <TableCell colSpan={keys.length}>
            //     {mapping["expand"].render?.(item)}
            //    </TableCell>
            // </TableRow>
            <>{mapping["expand"].render?.(item)}</>
          )}
        </Fragment>
      ))}
      {children}
    </>
  );

  const addFilter = (key: string, children: React.ReactNode) => {
    return (
      <Popover
        open={filterActive === key}
        onOpenChange={(vis) => onOpenChange(vis, key)}
      >
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent>
          <div className="p-1">
            <div className="flex gap-4 flex-col">
              <Label>Min</Label>
              <Input
                placeholder="Min"
                className="p-2"
                type="number"
                value={tmpFilter.min ?? ""}
                onChange={(e) =>
                  setTmpFilter((prev) => ({
                    ...prev,
                    min: Number(e.target.value),
                  }))
                }
              />
              <Label>Max</Label>
              <Input
                placeholder="Max"
                className="p-2"
                type="number"
                value={tmpFilter.max ?? ""}
                onChange={(e) =>
                  setTmpFilter((prev) => ({
                    ...prev,
                    max: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button
                className="btn"
                size="sm"
                variant="outline"
                onClick={() => {
                  setTmpFilter({ ...defaultFilter[key] });
                }}
              >
                Reset
              </Button>
              <Button
                className="btn btn-primary ml-2"
                size="sm"
                onClick={() => {
                  setFilterActive("");
                  setFilter((prev) => ({
                    ...prev,
                    [key]: {
                      ...prev?.[key],
                      ...tmpFilter,
                    },
                  }));
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderHeader = (
    type: string,
    label: string,
    key: string,
    filterable: boolean = false,
    sortable: boolean = true,
  ): JSX.Element => {
    const text = (
      <span
        key={key}
        className={cn(
          sort.key === key && "text-blue-500",
          (filter?.key?.min !== undefined || filter?.key?.max !== undefined) &&
            "font-bold",
        )}
      >
        {label}
      </span>
    );
    return (
      <TableHead className="text-nowrap" key={key}>
        {type === "text" && filterable ? addFilter(key, text) : text}
        {type === "text" && sortable && (
          <div
            className="inline-flex flex-col align-middle ml-1"
            onClick={() => onSort(key as keyof T)}
          >
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
        )}
      </TableHead>
    );
  };

  const renderHeaders = () => (
    <TableHeader>
      <TableRow key="header">
        {keys.map((key) => {
          const col = mapping[key];
          return renderHeader(
            col.type ?? "text",
            col.label,
            String(col.key),
            col.filterable,
            col.sortable,
          );
        })}
      </TableRow>
    </TableHeader>
  );

  if (!showHeader) {
    return renderRows();
  }

  return (
    <Table className={className ?? ""}>
      {renderHeaders()}

      <TableBody>{renderRows()}</TableBody>
    </Table>
  );
};

"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useCreateDivRecord } from "../hooks/use-create-div-record";
import { DivRecord } from "../schema";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useGetBuyRecords } from "../hooks/use-get-buy-records";
import { useStocksState } from "@/features/stock/store/use-stocks-store";
import { useEditDivBatch } from "../hooks/use-edit-div-batch";

interface ListItem {
  buyRecordId: string;
  divAmount: string;
}

export const CreateDivBatchModal = () => {
  const { isOpen, onClose, type, data, setData } = useModal();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const createMutation = useCreateDivRecord();
  const editMutation = useEditDivBatch();
  const { activeIds, mapping } = useActiveAccounts();
  const { stocksState } = useStocksState();
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const isModalOpen =
    isOpen &&
    type !== null &&
    ["createDivBatch", "editDivBatch"].includes(type);
  const { divBatch, stockCode: _stockCode } = data;
  const stockCode = useMemo(() => {
    return _stockCode ?? divBatch?.stockCode ?? "";
  }, [divBatch, _stockCode]);

  const edit = useMemo(() => type === "editDivBatch", [type]);

  const { data: _data, status } = useGetBuyRecords({
    accountIds:
      Array.from(new Set([...accountIds, ...(activeIds ?? [])])) ?? [],
    filter: {},
    sort: {},
    stockCode: stockCode ? [stockCode] : [],
    fetchAll: true,
  });

  const list = useMemo(() => {
    return (
      _data?.pages
        .flatMap((page) => page.data)
        .map((item) => {
          return {
            ...item,
            divAmount: item?.unsoldAmount ?? 0,
          };
        }) ?? []
    );
  }, [_data]);

  const listLoading = status == "pending";

  const formSchema = DivRecord;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      perDiv: "",
      divDate: new Date(),
      list: [] as Array<ListItem>,
    },
  });

  useEffect(() => {
    if (divBatch) {
      form.setValue("perDiv", String(divBatch.perDiv));
      form.setValue("divDate", new Date(divBatch.divDate));
      setSelected(
        new Set(divBatch?.divRecords?.map((item) => item?.buyRecordId) ?? []),
      );
      setAccountIds(divBatch?.accountIds ?? []);
      setInputs(
        divBatch?.divRecords?.reduce(
          (acc, cur) => {
            acc[cur.buyRecordId] = String(cur.divAmount);
            return acc;
          },
          {} as Record<string, string>,
        ) ?? {},
      );
    } else {
      form.setValue("perDiv", "");
      form.setValue("divDate", new Date());
      setSelected(new Set([]));
    }
  }, [divBatch, form]);

  useEffect(() => {
    if (list) {
      const ids = list?.map((item) => item._id) ?? [];
      if (!edit) {
        setSelected(new Set([...ids]));
        setInputs(
          list.reduce(
            (acc, cur) => {
              acc[cur._id] = String(cur.unsoldAmount);
              return acc;
            },
            {} as Record<string, string>,
          ),
        );
      }
    }
  }, [list, edit]);

  const isLoading = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!stockCode) return;
    const perDiv = Number(values["perDiv"]);
    const divDate = values["divDate"].toISOString();
    const list =
      values["list"]?.map((item) => ({
        ...item,
        divAmount: Number(item.divAmount),
      })) ?? [];
    if (edit) {
      const batchId = divBatch?._id;
      if (!batchId) return;
      editMutation.mutate(
        {
          param: {
            batchId,
          },
          json: {
            perDiv,
            divDate,
            stockCode,
            list,
          },
        },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );
      return;
    }
    createMutation.mutate(
      {
        json: {
          perDiv,
          divDate,
          stockCode,
          list,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    form.reset();
    setData({});
    onClose();
  };

  const switchSelected = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) {
      s.delete(id);
    } else {
      s.add(id);
    }
    setSelected(s);
  };

  const handleInput = (id: string, value: string) => {
    setInputs((prev) => {
      const _inputs = { ...prev };
      _inputs[id] = value;
      return _inputs;
    });
  };

  const _onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const list = Array.from(selected).map((id) => {
      return {
        buyRecordId: id,
        divAmount: inputs[id],
      };
    });
    form.setValue("list", list);
    form.handleSubmit(onSubmit)();
  };

  const renderBuyRecords = () => {
    return (
      <div>
        <div className="px-4 py-2 flex flex-row justify-between text-sm">
          <span className="">Buy Price</span>
          <span className="w-[150px] text-center">Unsould / Buy Amount</span>
          <span className="w-[120px] text-center">Dividend Amount </span>
          <span className="w-[100px] text-center">Account</span>
          <span className="w-[100px] text-right">Buy Date</span>
        </div>
        <ScrollArea className={cn("h-72 w-100 rounded-md border")}>
          <div className="p-4">
            {listLoading ? (
              <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              list?.map((record) => (
                <Fragment key={record._id}>
                  <div
                    className="text-sm flex flex-row items-center"
                    onClick={() => switchSelected(record._id)}
                  >
                    <Check
                      size={16}
                      className={cn(
                        "visible",
                        "mr-4",
                        selected.has(record._id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex-1 flex flex-row justify-between items-center">
                      <span>{record.buyPrice}</span>
                      <span className="w-[150px] text-center">
                        {record.unsoldAmount} / {record.buyAmount}
                      </span>
                      <Input
                        className="w-[120px] text-center"
                        value={inputs[record._id] ?? ""}
                        onChange={(e) =>
                          handleInput(record._id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="w-[100px] text-center">
                        {mapping?.[record.accountId]?.name}
                      </span>
                      <span className="w-[100px] text-right">
                        {format(new Date(record.buyDate), "PP")}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                </Fragment>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose} aria-modal>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden max-w-2xl"
        aria-modal
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            {edit ? "Edit" : "Create"} Dividend Record
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {stockCode && `${stockCode} - ${stocksState?.get(stockCode)?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => _onSubmit(e)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="perDiv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Dividend Per Share
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter dividend per share"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="divDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Dividend Date
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              initialFocus
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              {...field}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {renderBuyRecords()}
              {form?.formState?.errors?.list && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.list?.message}
                  {Array.isArray(form.formState.errors.list) &&
                    form.formState.errors.list.map(
                      (item) => item.divAmount?.message,
                    )}
                </p>
              )}
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading}>{edit ? "Edit" : "Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

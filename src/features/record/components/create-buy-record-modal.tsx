"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useMemo } from "react";
import { EXCHANGE } from "@/lib/const";
import { ResponseType } from "@/features/account/hooks/use-get-accounts";
import { ExtractArrayType } from "@/lib/types";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useCreateBuyRecord } from "../hooks/use-create-buy-record";
import { useEditBuyRecord } from "../hooks/use-edit-buy-record";
import { BuyRecord } from "../schema";

export type Account = ExtractArrayType<ResponseType["data"]>;
const formSchema = BuyRecord;

export const CreateBuyRecordModal = () => {
  const { isOpen, onClose, type, data, setData } = useModal();
  const { mutate: createMutate } = useCreateBuyRecord();
  const { mutate: editMutate } = useEditBuyRecord();

  const isModalOpen =
    isOpen &&
    type !== null &&
    ["createBuyRecord", "editBuyRecord"].includes(type);
  const { buyRecord } = data;

  const { accountsMenu } = useActiveAccounts();

  const edit = useMemo(() => type === "editBuyRecord", [type]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exchange: EXCHANGE[0],
      stockCode: "",
      buyPrice: "",
      buyAmount: "",
      buyDate: new Date(),
      accountId: "",
    },
  });

  useEffect(() => {
    let exchange, stockCode;
    if (buyRecord?.stockCode) {
      [exchange, stockCode] = [
        buyRecord.stockCode.slice(0, 2),
        buyRecord.stockCode.slice(2),
      ];
    }
    form.setValue(
      "exchange",
      (exchange ?? EXCHANGE[0]) as (typeof EXCHANGE)[number],
    );
    form.setValue("stockCode", stockCode ?? "");
    form.setValue("buyPrice", String(buyRecord?.buyPrice ?? ""));
    form.setValue("buyAmount", String(buyRecord?.buyAmount ?? ""));
    form.setValue(
      "buyDate",
      buyRecord?.buyDate ? new Date(buyRecord?.buyDate) : new Date(),
    );
    form.setValue("accountId", buyRecord?.accountId ?? "");
  }, [buyRecord, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const stockCode = values["exchange"] + values["stockCode"];
    const buyPrice = Number(values["buyPrice"]);
    const buyAmount = Number(values["buyAmount"]);
    const buyDate = values["buyDate"].toISOString();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exchange, ...res } = values;
    if (edit) {
      if (buyRecord?._id === undefined) return;
      editMutate(
        {
          param: {
            id: buyRecord._id,
          },
          json: {
            ...res,
            buyPrice,
            buyAmount,
            stockCode,
            buyDate,
          },
        },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );
      return;
    } else {
      createMutate(
        {
          ...res,
          buyPrice,
          buyAmount,
          stockCode,
          buyDate,
        },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );
    }
  };

  const handleClose = () => {
    form.reset();
    setData({});
    onClose();
  };

  const renderSelectItem = (menu: (typeof accountsMenu)[number]) => {
    return (
      <SelectGroup key={menu.label}>
        <SelectLabel>{menu.label}</SelectLabel>
        {menu.items.map((account: Account) => (
          <SelectItem key={account._id} value={account._id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectGroup>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose} aria-modal>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden"
        aria-modal
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            {edit ? "Edit" : "Create"} Buy Record
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="exchange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Exchange
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          defaultValue={field.value}
                          className="flex flex-row justify-between pt-2"
                        >
                          {EXCHANGE.map((type) => (
                            <div
                              className="flex items-center space-x-2"
                              key={type}
                            >
                              <RadioGroupItem value={type} id={type} />
                              <Label htmlFor={type} className="capitalize">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stockCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Stock Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Stock Code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Buy Price
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Buy Price"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buyAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Buy Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Buy Amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buyDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Buy Date
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
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Account
                      </FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                            <SelectValue placeholder="Select a account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountsMenu?.map((item) => renderSelectItem(item))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

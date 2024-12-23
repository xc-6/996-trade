"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useBuyRecordState } from "../store/use-buy-record-store";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useMemo } from "react";
import { EXCHANGE } from "@/lib/const";
import { useCreateSellRecord } from "../hooks/use-create-sell-record";
import { SellRecord } from "../schema";

export const CreateSellRecordModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const mutation = useCreateSellRecord();
  const { buyRecord } = useBuyRecordState();

  const isModalOpen = isOpen && type === "createSellRecord";
  const { sellRecord } = data;

  const maxAmount = useMemo(() => {
    const s =
      buyRecord?.sellRecords?.reduce(
        (acc, cur) => acc + Number(cur.sellAmount),
        0
      ) ?? 0;
    if (buyRecord) {
      return Number(buyRecord?.buyAmount) - s;
    }
    return 0;
  }, [buyRecord]);

  const formSchema = useMemo(() => {
    return SellRecord.extend({
      sellAmount: z
        .string({
          message: "Sell Amount is required.",
        })
        .refine(
          (v) => {
            const n = Number(v);
            return !isNaN(n) && v?.length > 0 && n <= maxAmount;
          },
          { message: "Invalid number" }
        ),
    });
  }, [maxAmount]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exchange: EXCHANGE[0],
      stockCode: "",
      sellPrice: "",
      sellAmount: "",
      sellDate: new Date(),
      accountId: "",
    },
  });

  useEffect(() => {
    if (sellRecord) {
      form.setValue("sellPrice", String(sellRecord.sellPrice));
      form.setValue("sellAmount", String(sellRecord.sellAmount));
    } else {
      form.setValue("sellPrice", "");
      form.setValue("sellAmount", "");
    }
  }, [sellRecord, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const sellPrice = Number(values["sellPrice"]);
    const sellAmount = Number(values["sellAmount"]);
    const sellDate = values["sellDate"].toISOString();
    mutation.mutate(
      {
        param: {
          buyRecordId: data?.buyRecordId ?? "",
        },
        json: {
          sellPrice,
          sellAmount,
          sellDate,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose} aria-modal>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden"
        aria-modal
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create Sell Record
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Sell Price
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Sell Price"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Sell Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter Sell Amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Sell Date
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
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
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading}>Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

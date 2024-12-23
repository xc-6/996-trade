"use client";

import { Fragment, useMemo, type MouseEvent } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { ExtractArrayType } from "@/lib/types";
import { ResponseType } from "@/features/account/hooks/use-get-accounts";

type Account = ExtractArrayType<ResponseType["data"]>;

export function AccontSwitcher() {
  const { isMobile } = useSidebar();
  const { onOpen } = useModal();
  const {
    allAccounts,
    activeIds,
    activeAccounts,
    selectAccount,
    removeAccount,
  } = useActiveAccounts();
  const activeIdSet = useMemo(() => new Set(activeIds), [activeIds]);

  const accoutsMenu = useMemo(() => {
    const currencys = Array.from(
      new Set(allAccounts?.map((account) => account.currency))
    ).sort();

    return currencys.map((currency) => {
      return {
        label: currency,
        items:
          allAccounts?.filter((account) => account.currency === currency) ?? [],
      };
    });
  }, [allAccounts]);

  const switchAccount = (e: MouseEvent, account: Account) => {
    e.preventDefault();
    if (activeIdSet.has(account._id)) {
      removeAccount(account._id);
    } else {
      selectAccount(account._id);
    }
  };

  const renderMenuItem = (menu: (typeof accoutsMenu)[number]) => {
    return (
      <Fragment key={menu.label}>
        <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
        {menu.items.map((account: Account) => (
          <DropdownMenuItem
            key={account._id}
            onClick={(e) => switchAccount(e, account)}
          >
            <Check
              className={cn(
                "visible",
                activeIdSet.has(account._id) ? "opacity-100" : "opacity-0"
              )}
            />
            {account.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
      </Fragment>
    );
  };

  const firstAccount = useMemo(() => {
    const arr = activeAccounts ?? [];
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr?.[0] ?? {};
  }, [activeAccounts]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10 text-sidebar-secondary-foreground">{firstAccount?.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {firstAccount?.name}
                </span>
                <span className="truncate text-xs">
                  {firstAccount?.currency}
                  {(activeAccounts?.length ?? 0) > 1 && (
                    <span className="ml-2 text-xs text-muted-foreground opacity-60">
                       +{(activeAccounts?.length ?? 0) - 1} accounts
                    </span>
                  )}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Accounts
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {accoutsMenu?.map((item) => renderMenuItem(item))}
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div
                className="font-medium text-muted-foreground"
                onClick={() => setTimeout(() => onOpen("createAccount"), 20)}
              >
                Add Account
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

"use client";
import {
  Download,
  Frame,
  Upload,
  Plus,
  PackageMinus,
  PiggyBank,
  LayoutDashboard,
} from "lucide-react";

import { NavUser } from "./nav-user";
import { AccontSwitcher } from "./account-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useMemo, useState } from "react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { queryFn } from "@/features/record/hooks/use-get-buy-records";
import { useQuery } from "@tanstack/react-query";
import { downloadRecords } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { onOpen } = useModal();
  const { accountsMenu, mapping } = useActiveAccounts();
  const [accountId, setAccountId] = useState<string>("");
  const { data, isLoading } = useQuery({
    enabled: !!accountId,
    queryKey: ["buyRecords", [accountId]],
    queryFn: () =>
      queryFn({
        accountIds: [accountId],
        showSold: true,
      }),
  });

  useEffect(() => {
    if (isLoading || !data || !accountId) {
      return;
    }
    const fileName = `[trade-insight]-${mapping[accountId]?.name}-${mapping[accountId]?.currency}.txt`;
    downloadRecords(fileName, data?.data ?? []);
    setAccountId("");
  }, [accountId, data, isLoading, mapping, setAccountId]);

  const menuItems = useMemo(() => {
    return [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        type: "link" as const,
      },
      {
        title: "Buy Record History",
        url: "/buy_record",
        icon: Plus,
        type: "link" as const,
      },
      {
        title: "Sell Record History",
        url: "/sell_record",
        icon: PackageMinus,
        type: "link" as const,
      },
      {
        title: "Dividend Record History",
        url: "/div_record",
        icon: PiggyBank,
        type: "link" as const,
      },
      {
        title: "Add Records",
        icon: Frame,
        type: "action" as const,
        onClick: () => {
          onOpen("createBuyRecord");
        },
      },
      {
        title: "Upload From File",
        icon: Upload,
        type: "submenu" as const,
        groups: accountsMenu.map((account) => ({
          label: account.label,
          items: account.items.map((item) => ({
            name: item.name,
            onClick: () => {
              onOpen("createRecordUpload", { account: item });
            },
          })),
        })),
      },
      {
        title: "Export To File",
        icon: Download,
        type: "submenu" as const,
        groups: accountsMenu.map((account) => ({
          label: account.label,
          items: account.items.map((item) => ({
            name: item.name,
            onClick: () => {
              setAccountId(item._id);
            },
          })),
        })),
      },
    ];
  }, [onOpen, accountsMenu]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AccontSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              if (item.type === "link") {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              if (item.type === "action") {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={item.onClick}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              if (item.type === "submenu") {
                // Always show dropdown menu for submenu items (both collapsed and expanded states)
                return (
                  <SidebarMenuItem key={item.title}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-48"
                      >
                        {item.groups?.map((group, groupIndex) => (
                          <div key={group.label}>
                            {group.label && (
                              <>
                                <DropdownMenuLabel>
                                  {group.label}
                                </DropdownMenuLabel>
                                {groupIndex <
                                  (item.groups?.length || 0) - 1 && (
                                  <DropdownMenuSeparator />
                                )}
                              </>
                            )}
                            <DropdownMenuGroup>
                              {group.items.map((subItem) => (
                                <DropdownMenuItem
                                  key={subItem.name}
                                  onClick={subItem.onClick}
                                  className="cursor-pointer"
                                >
                                  {subItem.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuGroup>
                            {groupIndex < (item.groups?.length || 0) - 1 && (
                              <DropdownMenuSeparator />
                            )}
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                );
              }

              return null;
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

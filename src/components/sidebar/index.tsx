"use client";
import { Download, Frame, SquareTerminal, Upload } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSub } from "./nav-sub";
import { NavUser } from "./nav-user";
import { AccontSwitcher } from "./account-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useMemo, useState } from "react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { queryFn } from "@/features/record/hooks/use-get-buy-records";
import { useQuery } from "@tanstack/react-query";
import { downloadRecords } from "@/lib/utils";

const navMain = [
  {
    title: "Playground",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
      },
      {
        title: "Buy Record History",
        url: "/buy_record",
      },
      {
        title: "Sell Record History",
        url: "/sell_record",
      },
    ],
  },
];

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

  const navSub = useMemo(() => {
    return [
      {
        name: "Add Records",
        icon: Frame,
        onClick: () => {
          onOpen("createBuyRecord");
        },
      },
      {
        name: "Upload From File",
        icon: Upload,
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
        name: "Export To File",
        icon: Download,
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
        <NavMain items={navMain} />
        <NavSub items={navSub} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

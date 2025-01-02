"use client";
import { Frame, SquareTerminal, Upload } from "lucide-react";

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
import { useMemo } from "react";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";

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
        title: "Record History",
        url: "/record",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { onOpen } = useModal();
  const { accountsMenu } = useActiveAccounts();

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

"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Fragment } from "react";

export function NavSub({
  items,
}: {
  items: {
    name: string;
    url?: string;
    icon: LucideIcon;
    onClick?: () => void;
    groups?: {
      label: string;
      items: {
        name: string;
        id?: string;
        onClick?: () => void;
      }[];
    }[];
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Actions</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name} onClick={() => item.onClick?.()}>
            {item.groups?.length ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <item.icon />
                    {item.name}
                    <MoreHorizontal className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                  className="min-w-56 rounded-lg"
                >
                  {item.groups.map((menu, idx) => (
                    <Fragment key={menu.label}>
                      {idx > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
                      {menu.items.map((account) => (
                        <DropdownMenuItem
                          key={account.id ?? account.name}
                          onClick={() => account.onClick?.()}
                        >
                          {account.name}
                        </DropdownMenuItem>
                      ))}
                    </Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild>
                <a>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
const MAPPING: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/buy_record": "Buy Record History",
  "/sell_record": "Sell Record History",
  "/div_record": "Dividend Record History",
  default: "Trade Insight",
};

export const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#"></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{MAPPING[pathname]}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="px-4 py-2" style={{ height: "calc(100vh - 64px)" }}>
        {children}
      </main>
    </>
  );
};

import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { protectServer } from "@/features/auth/utils";
import { LayoutClient } from "./client";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectServer();

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <LayoutClient>{children}</LayoutClient>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { useGetAccounts } from "@/features/account/hooks/use-get-accounts";
import { useModal } from "@/hooks/use-modal-store";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Page() {
  const { onOpen } = useModal();
  const router = useRouter();
  const { data, isLoading } = useGetAccounts();

  useEffect(() => {
    if (isLoading) return;
    if (!data?.length) {
      onOpen("createAccount");
    } else {
      router.push("/dashboard");
    }
  }, [isLoading, data, onOpen, router]);

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
}

"use client";

import { CreateAccountModal } from "@/features/account/components/create-account-modal";
import { CreateBuyRecordModal } from "@/features/record/components/create-buy-record-modal";
import { CreateSellRecordModal } from "@/features/record/components/create-sell-record-modal";
import { useClient } from "@/lib/hooks";

export const Modals = () => {
  const onlyClient = useClient();

  return (
    onlyClient && (
      <>
        <CreateAccountModal />
        <CreateBuyRecordModal />
        <CreateSellRecordModal/>
      </>
    )
  );
};

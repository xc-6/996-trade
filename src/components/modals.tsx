"use client";

import { CreateAccountModal } from "@/features/account/components/create-account-modal";
import { DeleteAccountModal } from "@/features/account/components/delete-account-modal";
import { CreateBuyRecordModal } from "@/features/record/components/create-buy-record-modal";
import { CreateSellRecordModal } from "@/features/record/components/create-sell-record-modal";
import { CreateRecordUploadModal } from "@/features/upload/components/create-record-upload-modal";
import { useClient } from "@/lib/hooks";

export const Modals = () => {
  const onlyClient = useClient();

  return (
    onlyClient && (
      <>
        <CreateAccountModal />
        <CreateBuyRecordModal />
        <CreateSellRecordModal />
        <CreateRecordUploadModal />
        <DeleteAccountModal />
      </>
    )
  );
};

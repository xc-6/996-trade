"use client";
import { BuyRecordTable } from "@/features/record/components/buy-record-table";
import { SellRecordTable } from "@/features/record/components/sell-record-table";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { X } from "lucide-react";
import { usePanel } from "@/features/record/hooks/use-panel";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useRefreshStocks } from "@/features/stock/hooks/use-refresh-stocks";

export default function Record() {
  useRefreshStocks();
  const { onOpen } = useModal();
  const { recordId, onClose } = usePanel();
  const showPanel = !!recordId;
  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="ca-workspace-layout"
    >
      <ResizablePanel defaultSize={100} minSize={50}>
        <BuyRecordTable />
      </ResizablePanel>
      {showPanel && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            minSize={20}
            defaultSize={29}
            className="overflow-scroll"
          >
            <Button onClick={onClose} className="mr-10 align-middle">
              <X />
            </Button>
            <Button
              onClick={() =>
                onOpen("createSellRecord", { buyRecordId: recordId })
              }
            >
              Add Sold Record
            </Button>
            <SellRecordTable />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

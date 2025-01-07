"use client";
import { SellRecordsTable } from "@/features/record/components/sell-records-table";
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
import { useClient } from "@/lib/hooks";
import { useRef } from "react";
import { useSize } from "ahooks";

export default function Record() {
  useRefreshStocks();
  const { onOpen } = useModal();
  const { recordId, onClose } = usePanel();
  const onlyClient = useClient();
  const showPanel = !!recordId;
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="ca-workspace-layout"
    >
      <ResizablePanel defaultSize={100} minSize={50} className="flex flex-col">
        {onlyClient && (
          <div className="grow overflow-scroll" ref={ref}>
            <SellRecordsTable style={{ height: `${size?.height}px` }} />
          </div>
        )}
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
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

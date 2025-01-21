"use client";
import { BuyRecordPanel } from "@/features/record/components/buy-record-panel";
import { BuyRecordTable } from "@/features/record/components/buy-record-table";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { usePanel } from "@/features/record/hooks/use-panel";
import { useRefreshStocks } from "@/features/stock/hooks/use-refresh-stocks";
import { useClient } from "@/lib/hooks";
import { useRef } from "react";
import { useSize } from "ahooks";

export default function Record() {
  useRefreshStocks();
  const { id: recordId } = usePanel();
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
            <BuyRecordTable style={{ height: `${size?.height}px` }} />
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
            <BuyRecordPanel />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

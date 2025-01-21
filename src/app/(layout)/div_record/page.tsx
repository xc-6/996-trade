"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { usePanel } from "@/features/record/hooks/use-panel";
import { useRefreshStocks } from "@/features/stock/hooks/use-refresh-stocks";
import { StockDivBatchesTable } from "@/features/record/components/stock-div-batches-table";
import { DivBatchPanel } from "@/features/record/components/div-batch-panel";
import { useClient } from "@/lib/hooks";
import { useRef } from "react";
import { useSize } from "ahooks";

export default function Dashboard() {
  useRefreshStocks();
  const { id: batchId } = usePanel();
  const onlyClient = useClient();
  const showPanel = !!batchId;
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="ca-workspace-layout"
    >
      <ResizablePanel defaultSize={100} minSize={50} className="flex flex-col">
        {onlyClient && (
          <div className="mt-4 grow overflow-scroll" ref={ref}>
            <StockDivBatchesTable style={{ height: `${size?.height}px` }} />
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
            <DivBatchPanel />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

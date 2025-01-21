import { SellRecordTable } from "@/features/record/components/sell-record-table";
import { DivRecordTable } from "./div-record-table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { usePanel } from "../hooks/use-panel";
import { useState } from "react";
export const BuyRecordPanel = () => {
  const { onOpen } = useModal();
  const { id: recordId, onClose } = usePanel();
  const [tab, setTab] = useState<"sell" | "div">("sell");
  return (
    <>
      <Button onClick={onClose} className="mx-4 align-middle">
        <X />
      </Button>
      <Button
        className="mr-4"
        onClick={() =>
          onOpen("createSellRecord", { buyRecordId: recordId as string })
        }
      >
        Add Sold Record
      </Button>
      <Button className="mr-4" onClick={() => setTab("sell")}>
        Sell Records
      </Button>
      <Button onClick={() => setTab("div")}>Dividend Records</Button>
      <div className="p-4">
        {tab == "sell" && <SellRecordTable />}
        {tab == "div" && <DivRecordTable />}
      </div>
    </>
  );
};

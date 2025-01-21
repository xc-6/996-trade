import { DivBatchTable } from "./div-batch-table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { usePanel } from "../hooks/use-panel";
export const DivBatchPanel = () => {
  const { onClose } = usePanel();
  return (
    <>
      <Button onClick={onClose} className="mr-10 align-middle">
        <X />
      </Button>
      <div className="p-4">
        <DivBatchTable />
      </div>
    </>
  );
};

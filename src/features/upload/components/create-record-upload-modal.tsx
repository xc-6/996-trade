import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";
import { useUploadRecords } from "../hooks/use-upload-records";

export const CreateRecordUploadModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [files, setFiles] = useState<File[]>([]);
  const mutation = useUploadRecords();

  const isModalOpen = isOpen && type === "createRecordUpload";

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    if (files.length == 0) {
      return;
    }
    const text = await files[0].text();
    console.log(text);
    const lines = text.split("\n");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: Array<any> = [];
    lines.forEach((line) => {
      line = line.trim();
      if (line) {
        const items = line.split(",");
        if (items.length === 4) {
          const [buyDate, stockCode, buyPrice, buyAmount] = items;
          records.push({
            buyDate: new Date(buyDate).toISOString(),
            stockCode,
            buyPrice: Number(buyPrice),
            buyAmount: Number(buyAmount),
            sellRecords: [],
          });
        } else if (items.length === 3) {
          const [sellDate, sellPrice, sellAmount] = items;
          records?.at(-1)?.sellRecords.push({
            sellDate: new Date(sellDate).toISOString(),
            sellPrice: Number(sellPrice),
            sellAmount: Number(sellAmount),
          });
        }
      }
    });

    mutation.mutate({ accountId: data?.account?._id ?? "", records },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose} aria-modal>
      <DialogContent aria-modal>
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Upload Records
          </DialogTitle>
          <DialogDescription className="text-center">
            Currency: {data?.account?.currency} | Account: {data?.account?.name}
          </DialogDescription>
        </DialogHeader>
        <FileUploader
          maxFileCount={1}
          maxSize={8 * 1024 * 1024}
          onValueChange={(e) => {
            console.log(e);
            setFiles(e);
          }}
          accept={{
            "text/plain": [".txt"],
          }}
        />
        <DialogFooter className="pt-2">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

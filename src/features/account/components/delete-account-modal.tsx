"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActiveAccounts } from "@/features/account/hooks/use-active-accounts";
import { useModal } from "@/hooks/use-modal-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { useDeleteAccount } from "../hooks/use-delete-account";
import { Account } from "@/features/record/components/create-buy-record-modal";
import { useMemo, useState } from "react";

export const DeleteAccountModal = () => {
  const { isOpen, onClose, type } = useModal();
  const mutation = useDeleteAccount();
  const [selectedId, setSelectedId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const isModalOpen = isOpen && type === "deleteAccount";
  const { accountsMenu, mapping, removeAccount } = useActiveAccounts();

  const accountName = useMemo(() => {
    const account = mapping[selectedId];
    return account?.name ?? "";
  }, [mapping, selectedId]);

  const disabled = useMemo(() => {
    if (mutation.isPending || accountName === "") {
      return true;
    }
    return accountName !== inputValue;
  }, [mutation.isPending, accountName, inputValue]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedId) {
      return;
    }
    mutation.mutate(
      {
        id: selectedId,
      },
      {
        onSuccess: () => {
          handleClose();
          removeAccount(selectedId);
        },
      },
    );
  };

  const renderSelectItem = (menu: (typeof accountsMenu)[number]) => {
    return (
      <SelectGroup key={menu.label}>
        <SelectLabel>{menu.label}</SelectLabel>
        {menu.items.map((account: Account) => (
          <SelectItem key={account._id} value={account._id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectGroup>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose} aria-modal>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden"
        aria-modal
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Account
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6">
          <p className="text-sm text-muted-foreground">Account</p>
          <Select
            disabled={mutation.isPending}
            value={selectedId}
            onValueChange={(val) => setSelectedId(val)}
          >
            <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
              <SelectValue placeholder="Select a account" />
            </SelectTrigger>
            <SelectContent>
              {accountsMenu?.map((item) => renderSelectItem(item))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Repeat</p>
          <Input
            className="mt-4"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type the account name to confirm"
          ></Input>
        </div>
        <DialogFooter className="px-6 py-4">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button disabled={disabled} onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

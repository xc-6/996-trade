import { LOCAL_STORAGE_ACCOUNT_KEY } from "@/lib/const";
import { useGetAccounts } from "./use-get-accounts";
import { useLocalStorageState } from "ahooks";
import { useCallback, useMemo } from "react";
import { Account } from "@/features/account/schema";
import { z } from "zod";

export const useActiveAccounts = () => {
  const { data, isLoading } = useGetAccounts();
  const [selected, setSelected] = useLocalStorageState<Array<string>>(
    LOCAL_STORAGE_ACCOUNT_KEY,
    {
      defaultValue: () => new Array<string>(),
      serializer: (v: Array<string>) => v.join(",") ?? "",
      deserializer: (v: string) => v.split(","),
      listenStorageChange: true,
    },
  );

  const activeAccounts = useMemo(() => {
    if (isLoading) {
      return [];
    }
    return data?.filter((item) => selected?.includes(item._id));
  }, [data, isLoading, selected]);

  const mapping = useMemo(() => {
    if (isLoading) {
      return {};
    }
    return (
      data?.reduce((res: Record<string, z.infer<typeof Account>>, item) => {
        res[item._id] = item;
        return res;
      }, {}) ?? {}
    );
  }, [data, isLoading]);

  const accountsMenu = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const currencys = Array.from(
      new Set(data?.map((account) => account.currency)),
    ).sort();

    return currencys.map((currency) => {
      return {
        label: currency,
        items: data?.filter((account) => account.currency === currency) ?? [],
      };
    });
  }, [data, isLoading]);

  const selectAccount = useCallback(
    (id: string) => {
      const s = new Set(selected);
      s.add(id);
      setSelected([...s]);
    },
    [selected, setSelected],
  );

  const removeAccount = useCallback(
    (id: string) => {
      const s = new Set(selected);
      s.delete(id);
      setSelected([...s]);
    },
    [selected, setSelected],
  );

  return {
    isLoading,
    allAccounts: isLoading ? [] : data,
    activeIds: selected,
    activeAccounts: isLoading ? [] : activeAccounts,
    selectAccount,
    removeAccount,
    mapping,
    accountsMenu,
  };
};

"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/request";

export const Stocks = () => {
  const [string, setString] = useState("SH511090");
  const [res, setRes] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timer = useRef<any>(null);

  const onClickHandler = useCallback(async () => {
    const data = await api.$get("/api/stock", { input: string });
    setRes(await data.json());
  }, [string]);

  const switcher = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    } else {
      timer.current = setInterval(onClickHandler, 1000);
    }
  }, [onClickHandler]);

  return (
    <div>
      <Input value={string} onChange={(e) => setString(e.target.value)} />
      <Button onClick={() => switcher()}>Get</Button>
      {JSON.stringify(res)}
    </div>
  );
};

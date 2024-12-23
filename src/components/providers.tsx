"use client";

import { QueryProvider } from "@/components/query-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

interface ProvidersProps {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryProvider>
      <NuqsAdapter>
      {children}
      </NuqsAdapter>
    </QueryProvider>
  );
};

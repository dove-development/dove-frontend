"use client";

import Ledger from "@/lib/ledger";
import React, { createContext, useContext } from "react";
import { useWallet } from "@/components/providers/wallet-provider";
import { useCacheInvalidate } from "@/components/providers/cache-provider";

const LedgerContext = createContext<Ledger | undefined>(undefined);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
    const wallet = useWallet();
    const invalidate = useCacheInvalidate();
    const ledger = new Ledger(wallet, invalidate);
    return <LedgerContext.Provider value={ledger}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
    const context = useContext(LedgerContext);
    if (!context) {
        throw new Error("useLedger must be used within a LedgerProvider");
    }
    return context;
}

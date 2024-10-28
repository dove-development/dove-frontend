"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import init from "@/../pkg/dove";

export type Dove = {
    initialized: boolean;
};

const DoveContext = createContext<Dove | undefined>(undefined);

export function DoveProvider({ children }: { children: React.ReactNode }) {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        (async () => {
            await init({
                module_or_path: "pkg/dove_bg.wasm"
            });
            setInitialized(true);
        })();
    }, []);

    return (
        <DoveContext.Provider value={{ initialized }}>{children}</DoveContext.Provider>
    );
}

export function useDove() {
    const context = useContext(DoveContext);
    if (context === undefined) {
        throw new Error("useDove must be used within a DoveProvider");
    }
    return context;
}

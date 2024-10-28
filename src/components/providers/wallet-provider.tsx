"use client";

import React, { useEffect, useMemo } from "react";
import { ConnectionProvider, useConnection } from "@solana/wallet-adapter-react";
import { Wallet } from "@/lib/wallet";
import {
    UnifiedWalletProvider,
    useUnifiedWallet,
    useUnifiedWalletContext
} from "@jup-ag/wallet-adapter";
import {
    CoinbaseWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets";

function JupiterSyncProps() {
    const contextState = useUnifiedWallet();
    useEffect(() => {
        const Jupiter = window.Jupiter;
        if (!Jupiter) return;
        Jupiter.syncProps({
            passthroughWalletContextState: contextState
        });
    }, [contextState]);
    return <></>;
}

export function WalletProvider({
    rpcUrl,
    children
}: {
    rpcUrl: string;
    children: React.ReactNode;
}): React.ReactNode {
    const wallets = useMemo(
        () => [
            new CoinbaseWalletAdapter(),
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter()
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={rpcUrl}>
            <UnifiedWalletProvider
                wallets={wallets}
                config={{
                    autoConnect: false,
                    env: "mainnet-beta",
                    provider: "solana-wallet-adapter",
                    metadata: {
                        name: "Wallet",
                        description: "Wallet",
                        url: "https://marginfi.gg",
                        iconUrls: ["https://app.marginfi.com/mrgn_logo_512.png"]
                    },
                    theme: "light"
                }}
            >
                <JupiterSyncProps />
                {children}
            </UnifiedWalletProvider>
        </ConnectionProvider>
    );
}

export function useWallet(): Wallet {
    const contextState = useUnifiedWallet();
    const { connection } = useConnection();
    const { setShowModal } = useUnifiedWalletContext();

    return new Wallet(contextState, connection, setShowModal);
}

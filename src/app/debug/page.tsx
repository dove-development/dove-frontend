"use client";

import { useState, useEffect, useMemo } from "react";
import { DOVE_PROGRAM_ID } from "@/lib/constants";
import { PublicKey } from "@solana/web3.js";
import { Authority } from "../../../pkg/dove";
import { useWallet } from "@/components/providers/wallet-provider";
import { useDove } from "@/components/providers/dove-provider";
import { Loader2, AlertCircle } from "lucide-react";
import { useCache } from "@/components/providers/cache-provider";
import WorldCache from "@/lib/cache/world-cache";
import { useLedger } from "@/components/providers/ledger-provider";
import AuthorityCache from "@/lib/cache/authority-cache";
import { Asset } from "@/lib/structs/asset";
import CollateralCache from "@/lib/cache/collateral-cache";
import DvdCache from "@/lib/cache/dvd-cache";
import DoveCache from "@/lib/cache/dove-cache";
import StabilityCache from "@/lib/cache/stability-cache";
import StablecoinCache from "@/lib/cache/stablecoin-cache";
import VaultCache from "@/lib/cache/vault-cache";
import DvdTrading from "./dvd-trading";
import VaultInfo from "./vault-info";
import AssetCache from "@/lib/cache/asset-cache";
import VestingInfo from "./vesting-info";
import ProgramInfo from "./program-info";
import SystemSetup from "./system-setup";
import OfferingInfo from "./offering-info";
import FlashMint from "./flash-mint";

// Add types for the main component props
interface DebugProps {}

export default function Debug({}: DebugProps) {
    const wallet = useWallet();
    const dove = useDove();
    const ledger = useLedger();

    const [worldCache, worldError] = useCache(WorldCache, []);
    const [authorityCache, authorityError] = useCache(AuthorityCache, []);
    const [collateralCache, collateralError] = useCache(CollateralCache, []);
    const [dvdCache, dvdError] = useCache(DvdCache, [worldCache]);
    const [doveCache, doveError] = useCache(DoveCache, [worldCache]);
    const [vaultCache, vaultError] = useCache(VaultCache, [
        worldCache,
        collateralCache
    ]);
    const [stabilityCache, stabilityError] = useCache(StabilityCache, [worldCache]);
    const [stablecoinCache, stablecoinError] = useCache(StablecoinCache, []);
    const [assetCache, assetError] = useCache(AssetCache, [collateralCache]);

    const vault = vaultCache?.vault;

    const cacheError =
        worldError ||
        authorityError ||
        collateralError ||
        dvdError ||
        doveError ||
        vaultError ||
        stabilityError ||
        stablecoinError ||
        assetError;

    const [dvdMint, setDvdMint] = useState<PublicKey | undefined>();
    const [doveMint, setDoveMint] = useState<PublicKey | undefined>();
    useEffect(() => {
        const { world } = worldCache || {};
        if (!world) return;
        const newDoveMint = new PublicKey(world.dove.mint);
        const newDvdMint = new PublicKey(world.dvd.mint);
        if (!doveMint || !newDoveMint.equals(doveMint)) {
            setDoveMint(newDoveMint);
        }
        if (!dvdMint || !newDvdMint.equals(dvdMint)) {
            setDvdMint(newDvdMint);
        }
    }, [worldCache]);

    const walletBalance = assetCache?.get(Asset.SOL)?.balance || 0;
    const [createMetadata, setCreateMetadata] = useState<boolean>(false);

    const authorityKey = useMemo<PublicKey | undefined>(() => {
        if (!dove.initialized) return undefined;
        return new PublicKey(Authority.deriveKey(DOVE_PROGRAM_ID.toBuffer())!);
    }, [dove.initialized]);

    if (!wallet.connected) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
                    role="alert"
                >
                    <div className="flex items-center">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <p className="font-bold">Wallet not connected</p>
                    </div>
                    <p className="mt-2">
                        Please connect your wallet to use the debug page.
                    </p>
                </div>
            </div>
        );
    }

    if (!dove.initialized) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-700">
                        Loading WebAssembly...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8 text-white">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-100">Debug</h1>

            <ProgramInfo
                authorityKey={authorityKey}
                walletBalance={walletBalance}
                cacheError={cacheError}
                dvdCache={dvdCache}
                doveCache={doveCache}
                dvdMint={dvdMint}
                doveMint={doveMint}
                ledger={ledger}
            />

            <SystemSetup
                createMetadata={createMetadata}
                setCreateMetadata={setCreateMetadata}
                wallet={wallet}
                dvdMint={dvdMint}
                doveMint={doveMint}
                worldCache={worldCache}
                authorityCache={authorityCache}
                collateralCache={collateralCache}
                stablecoinCache={stablecoinCache}
                assetCache={assetCache}
                stabilityCache={stabilityCache}
                ledger={ledger}
                setDvdMint={setDvdMint}
                setDoveMint={setDoveMint}
                authorityKey={authorityKey}
            />

            <DvdTrading
                stabilityCache={stabilityCache}
                worldCache={worldCache}
                dvdCache={dvdCache}
                stablecoinCache={stablecoinCache}
                ledger={ledger}
            />

            <VaultInfo
                vault={vault}
                vaultCache={vaultCache}
                worldCache={worldCache}
                dvdCache={dvdCache}
                ledger={ledger}
            />

            <VestingInfo
                world={worldCache?.world}
                ledger={ledger}
                doveCache={doveCache}
            />

            <OfferingInfo
                worldCache={worldCache}
                ledger={ledger}
                doveCache={doveCache}
                dvdCache={dvdCache}
            />

            <FlashMint worldCache={worldCache} ledger={ledger} dvdCache={dvdCache} />
        </div>
    );
}

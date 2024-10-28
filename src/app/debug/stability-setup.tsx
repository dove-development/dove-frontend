import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import Stablecoin from "@/lib/structs/stablecoin";
import StabilityCache from "@/lib/cache/stability-cache";
import WorldCache from "@/lib/cache/world-cache";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@/lib/wallet";
import Ledger from "@/lib/ledger";

interface StabilitySetupProps {
    stablecoin: Stablecoin;
    worldCache?: WorldCache;
    stabilityCache?: StabilityCache;
    wallet: Wallet;
    ledger: Ledger;
}

export default function StabilitySetup({
    stablecoin,
    worldCache,
    stabilityCache,
    wallet,
    ledger
}: StabilitySetupProps) {
    const [loading, setLoading] = useState<string>("");
    const [error, setError] = useState<string>("");

    const createStability = async () => {
        setLoading(`Creating ${stablecoin.name} Stability...`);
        setError("");
        try {
            if (
                stablecoin.debugKeypair &&
                !(await wallet.getAccountData(stablecoin.mint))?.length
            ) {
                await ledger.createMint({
                    name: stablecoin.name,
                    symbol: stablecoin.symbol,
                    decimals: 9,
                    initialSupply: Math.floor(Math.random() * 10 ** 9),
                    mintAuthority: PublicKey.default,
                    freezeAuthority: null,
                    updateAuthority: null,
                    createMetadata: false,
                    metadataUrl: "",
                    keypair: stablecoin.debugKeypair
                });
            }
            await ledger.createStability(
                stablecoin.mint,
                1_000 // very small initial mint limit
            );
        } catch (e: any) {
            console.error(e);
            setError(e.toString());
        } finally {
            setLoading("");
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-100">
                    {stablecoin.name} Stability
                </h3>
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        stabilityCache?.get(stablecoin)
                            ? "bg-green-500 text-green-100"
                            : "bg-red-500 text-red-100"
                    }`}
                >
                    {stabilityCache?.get(stablecoin) ? "Created" : "Not Created"}
                </span>
            </div>
            <Button
                onClick={createStability}
                disabled={!!loading || !worldCache || !!stabilityCache?.get(stablecoin)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {loading || "Create Stability"}
            </Button>
            {error && (
                <div className="mt-4 flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

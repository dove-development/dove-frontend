import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useWallet } from "@/components/providers/wallet-provider";
import { useLedger } from "@/components/providers/ledger-provider";
import AssetCache from "@/lib/cache/asset-cache";
import { Input } from "@/components/ui/input";
import { solToLamports } from "@/lib/utils";

interface RequestAirdropProps {
    disabled: boolean;
}

export default function RequestAirdrop({ disabled }: RequestAirdropProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wallet = useWallet();
    const ledger = useLedger();
    const [airdropAmount, setAirdropAmount] = useState<number>(5);

    const requestAirdrop = async () => {
        if (!wallet.pubkey) return;
        setLoading(true);
        setError(null);
        try {
            await wallet.requestAirdrop(wallet.pubkey, airdropAmount);
            ledger.invalidate([AssetCache]);
        } catch (error) {
            console.error("Airdrop failed:", error);
            setError(error instanceof Error ? error.message : "Airdrop failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex space-x-2">
                <Input
                    type="number"
                    value={airdropAmount}
                    onChange={(e) => setAirdropAmount(Number(e.target.value))}
                    min="1"
                    step="1"
                    className="w-24 bg-gray-600 text-white border-gray-500"
                />
                <Button
                    onClick={requestAirdrop}
                    disabled={disabled || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Request Airdrop
                </Button>
            </div>
            {error && (
                <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
        </div>
    );
}

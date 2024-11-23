import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import Stablecoin from "@/lib/structs/stablecoin";
import StabilityCache from "@/lib/cache/stability-cache";
import WorldCache from "@/lib/cache/world-cache";
import DvdCache from "@/lib/cache/dvd-cache";
import StablecoinCache from "@/lib/cache/stablecoin-cache";
import Ledger from "@/lib/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stability } from "../../../pkg/dove";

interface StablecoinTradingCardProps {
    stablecoin: Stablecoin;
    stability?: Stability;
    loading: string;
    onSetMaxDeposit: (newMaxDeposit: string) => void;
    onBuyDvd: (amount: string) => void;
    onSellDvd: (amount: string) => void;
    isDisabled: boolean;
}

function StablecoinTradingCard({
    stablecoin,
    stability,
    loading,
    onSetMaxDeposit,
    onBuyDvd,
    onSellDvd,
    isDisabled
}: StablecoinTradingCardProps) {
    const [amount, setAmount] = useState<string>("");
    const [newMaxDeposit, setNewMaxDeposit] = useState<string>("");

    return (
        <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-medium mb-2 text-gray-300">{stablecoin.name}</h4>
            <p className="text-sm text-gray-400">Deposited: {stability?.deposited.toString() || "N/A"}</p>
            <p className="text-sm text-gray-400 mb-4">Max Deposit: {stability?.maxDeposit.toString() || "N/A"}</p>
            <div className="flex flex-col space-y-2 mb-4">
                <Input
                    type="number"
                    placeholder="New Max Deposit"
                    value={newMaxDeposit}
                    onChange={(e) => setNewMaxDeposit(e.target.value)}
                    className="w-full"
                />
                <Button
                    onClick={() => onSetMaxDeposit(newMaxDeposit)}
                    disabled={!stability || !!loading}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white"
                >
                    {loading === `Updating deposit limit for ${stablecoin.name}...` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Deposit Limit
                </Button>
            </div>
            <div className="flex flex-col space-y-2">
                <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full"
                />
                <div className="flex space-x-2">
                    <Button
                        onClick={() => onBuyDvd(amount)}
                        disabled={isDisabled || !!loading}
                        className="flex-1 bg-green-700 hover:bg-green-600 text-white"
                    >
                        {loading === `Buying DVD with ${stablecoin.name}...` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Buy DVD
                    </Button>
                    <Button
                        onClick={() => onSellDvd(amount)}
                        disabled={isDisabled || !!loading}
                        className="flex-1 bg-red-700 hover:bg-red-600 text-white"
                    >
                        {loading === `Selling DVD for ${stablecoin.name}...` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sell DVD
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface DvdTradingProps {
    stabilityCache?: StabilityCache;
    worldCache?: WorldCache;
    dvdCache?: DvdCache;
    stablecoinCache?: StablecoinCache;
    ledger: Ledger;
}

export default function DvdTrading({
    stabilityCache,
    worldCache,
    dvdCache,
    stablecoinCache,
    ledger
}: DvdTradingProps) {
    const [loading, setLoading] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSetMaxDeposit = async (stablecoin: Stablecoin, newMaxDeposit: string) => {
        const parsedMaxDeposit = Number(newMaxDeposit);
        const stability = stabilityCache?.get(stablecoin);
        if (parsedMaxDeposit && stability) {
            setLoading(`Updating deposit limit for ${stablecoin.name}...`);
            setError("");
            try {
                await ledger.setStabilityMaxDeposit(parsedMaxDeposit, stability);
            } catch (e: any) {
                setError(e.toString());
            } finally {
                setLoading("");
            }
        }
    };

    const handleBuyDvd = async (stablecoin: Stablecoin, amount: string) => {
        const parsedAmount = Number(amount);
        if (parsedAmount && worldCache && dvdCache) {
            setLoading(`Buying DVD with ${stablecoin.name}...`);
            setError("");
            try {
                await ledger.buyDvd(parsedAmount, stablecoin, worldCache.world, dvdCache);
            } catch (e: any) {
                setError(e.toString());
            } finally {
                setLoading("");
            }
        }
    };

    const handleSellDvd = async (stablecoin: Stablecoin, amount: string) => {
        const parsedAmount = Number(amount);
        if (parsedAmount && worldCache && stablecoinCache) {
            setLoading(`Selling DVD for ${stablecoin.name}...`);
            setError("");
            try {
                await ledger.sellDvd(parsedAmount, stablecoin, worldCache.world, stablecoinCache);
            } catch (e: any) {
                setError(e.toString());
            } finally {
                setLoading("");
            }
        }
    };

    return (
        <Card className="mt-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-t-lg">
                <CardTitle className="text-2xl">DVD Trading</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Stablecoin.LIST.filter((stablecoin) => stablecoin.hasStability).map((stablecoin) => (
                        <StablecoinTradingCard
                            key={stablecoin.symbol}
                            stablecoin={stablecoin}
                            stability={stabilityCache?.get(stablecoin)}
                            loading={loading}
                            onSetMaxDeposit={(newMaxDeposit) => handleSetMaxDeposit(stablecoin, newMaxDeposit)}
                            onBuyDvd={(amount) => handleBuyDvd(stablecoin, amount)}
                            onSellDvd={(amount) => handleSellDvd(stablecoin, amount)}
                            isDisabled={!worldCache || !stabilityCache || !dvdCache || !stablecoinCache}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

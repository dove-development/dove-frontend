import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { Vault } from "@/../pkg/dove";
import VaultCache from "@/lib/cache/vault-cache";
import WorldCache from "@/lib/cache/world-cache";
import DvdCache from "@/lib/cache/dvd-cache";
import Ledger from "@/lib/ledger";
import { Asset } from "@/lib/structs/asset";
import { PublicKey } from "@solana/web3.js";
import { nf } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Add types for VaultInfo props
interface VaultInfoProps {
    vault?: Vault;
    vaultCache?: VaultCache;
    worldCache?: WorldCache;
    dvdCache?: DvdCache;
    ledger: Ledger;
}

export default function VaultInfo({
    vault,
    vaultCache,
    worldCache,
    dvdCache,
    ledger
}: VaultInfoProps) {
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
    const [loading, setLoading] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const auctionConfig = worldCache?.world.config.auctionConfig;
    const isLiquidated = !!vault?.isLiquidated;
    const isAuctionOver = !!(
        auctionConfig &&
        vault &&
        vault.isAuctionOver(currentTime, auctionConfig)
    );
    const disableButtons = !worldCache || !dvdCache || !vaultCache || !!loading;

    const handleLiquidationClick = async () => {
        if (worldCache && dvdCache && vaultCache) {
            setLoading(
                isLiquidated ? "Unliquidating vault..." : "Liquidating vault..."
            );
            setError("");
            try {
                if (isLiquidated) {
                    await ledger.unliquidate();
                } else {
                    await ledger.liquidate(vaultCache, worldCache.world, dvdCache);
                }
            } catch (e: any) {
                setError(e.toString());
            } finally {
                setLoading("");
            }
        }
    };

    const handleFailAuctionClick = async () => {
        if (worldCache && dvdCache && vaultCache) {
            setLoading("Failing auction...");
            setError("");
            try {
                await ledger.failAuction(worldCache.world);
            } catch (e: any) {
                setError(e.toString());
            } finally {
                setLoading("");
            }
        }
    };

    const renderReserve = (reserve: any, index: number) => {
        const asset = Asset.byMint(new PublicKey(reserve.mintKey));
        const auctionPrice =
            auctionConfig && vault
                ? vault.calculateAuctionPrice(index, currentTime, auctionConfig)
                : 0;
        const failPrice =
            auctionConfig && vault
                ? vault.getAuctionFailPrice(auctionConfig, index)
                : 0;
        const secsElapsed = vault ? vault.getAuctionSecsElapsed(currentTime) : 0;

        const handleBuyCollateral = async () => {
            const amountInput = document.getElementById(
                `buyCollateralAmount-${index}`
            ) as HTMLInputElement;
            const amount = Number(amountInput.value);
            if (amount && worldCache && dvdCache && vault) {
                setLoading(`Buying Collateral ${index + 1}...`);
                setError("");
                try {
                    await ledger.buyCollateral(
                        amount,
                        worldCache.world,
                        dvdCache,
                        vault,
                        index
                    );
                } catch (e: any) {
                    setError(e.toString());
                } finally {
                    setLoading("");
                }
            }
        };

        return (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h5 className="text-lg font-medium text-blue-300">
                        Reserve {index + 1}
                    </h5>
                    <span className="text-sm font-semibold text-blue-400">
                        {asset?.symbol || "Unknown"}
                    </span>
                </div>
                <p className="text-blue-300 mb-3">
                    Amount:{" "}
                    <span className="font-medium text-blue-100">
                        {nf(reserve.balance, 4)}
                    </span>
                </p>
                {vault && worldCache && (
                    <>
                        <p className="text-blue-300 mb-3">
                            Price per unit:{" "}
                            <span className="font-medium text-blue-100">
                                {isLiquidated && auctionPrice !== undefined
                                    ? nf(auctionPrice, 2) + " DVD"
                                    : "N/A"}
                            </span>
                        </p>
                        <p className="text-blue-300 mb-3">
                            Fail price:{" "}
                            <span className="font-medium text-blue-100">
                                {isLiquidated && failPrice !== undefined
                                    ? nf(failPrice, 2) + " DVD"
                                    : "N/A"}
                            </span>
                        </p>
                        <p className="text-blue-300 mb-3">
                            Seconds elapsed since auction start:{" "}
                            <span className="font-medium text-blue-100">
                                {isLiquidated && secsElapsed !== undefined
                                    ? secsElapsed
                                    : "N/A"}
                            </span>
                        </p>
                    </>
                )}
                <div className="flex items-center space-x-2">
                    <Input
                        type="number"
                        placeholder="DVD Amount"
                        id={`buyCollateralAmount-${index}`}
                        disabled={!isLiquidated}
                        className="flex-grow bg-gray-700 text-blue-100 border-gray-600 placeholder-blue-300"
                    />
                    <Button
                        onClick={handleBuyCollateral}
                        disabled={disableButtons || !isLiquidated}
                        className="bg-blue-700 hover:bg-blue-600 text-blue-100"
                    >
                        {loading === `Buying Collateral ${index + 1}...` ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Buy Collateral
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Card className="mt-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Vault Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md flex items-center">
                        <AlertCircle className="mr-2" />
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-blue-300 mb-1">Debt</p>
                        <p className="text-2xl font-medium text-blue-100">
                            {nf(vaultCache?.debt || 0, 2)} DVD
                        </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-blue-300 mb-1">Liquidation Status</p>
                        <p
                            className={`text-2xl font-medium ${isLiquidated ? "text-blue-400" : "text-blue-200"}`}
                        >
                            {isLiquidated ? "Liquidated" : "Not Liquidated"}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleLiquidationClick}
                    disabled={disableButtons}
                    className={`w-full py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        isLiquidated
                            ? "bg-blue-800 hover:bg-blue-700 text-blue-100"
                            : "bg-blue-700 hover:bg-blue-600 text-blue-100"
                    }`}
                >
                    {loading ===
                    (isLiquidated
                        ? "Unliquidating vault..."
                        : "Liquidating vault...") ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                    ) : null}
                    {isLiquidated ? "Unliquidate Vault" : "Liquidate Vault"}
                </Button>
                <Button
                    onClick={handleFailAuctionClick}
                    disabled={!isAuctionOver || disableButtons}
                    className="w-full mt-4 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 bg-purple-700 hover:bg-fuchsia-600 text-pink-100"
                >
                    {loading === "Failing auction..." ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                    ) : null}
                    Fail Auction
                </Button>
                <h4 className="text-xl font-semibold mt-8 mb-4 text-blue-200">
                    Reserves
                </h4>
                <div className="space-y-6">
                    {vault?.reserves.map((reserve, index) =>
                        renderReserve(reserve, index)
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

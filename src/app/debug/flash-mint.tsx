import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { nf } from "@/lib/utils";
import { World, Config, FlashMintConfig } from "@/../pkg/dove";
import Ledger from "@/lib/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DvdCache from "@/lib/cache/dvd-cache";
import WorldCache from "@/lib/cache/world-cache";
import { Input } from "@/components/ui/input";

export default function FlashMint({
    worldCache,
    ledger,
    dvdCache
}: {
    worldCache?: WorldCache;
    ledger: Ledger;
    dvdCache?: DvdCache;
}) {
    const world = worldCache?.world;
    const config = world?.config;
    const flashMintConfig = config?.flashMintConfig;
    const currentFee = flashMintConfig?.fee || 0;
    const currentLimit = flashMintConfig?.limit || 0;

    const [mintAmount, setMintAmount] = useState<number>(0);
    const [newFeePercent, setNewFeePercent] = useState<number>(currentFee * 100);
    const [newLimit, setNewLimit] = useState<number>(currentLimit);
    const [mintLoading, setMintLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [includeBegin, setIncludeBegin] = useState(true);
    const [includeEnd, setIncludeEnd] = useState(true);

    const handleFlashMint = async () => {
        setMintLoading(true);
        setError(null);
        try {
            if (!world || !dvdCache) {
                throw new Error("Required data not loaded");
            }
            await ledger.flashMint(
                mintAmount,
                world,
                dvdCache,
                includeBegin,
                includeEnd
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setMintLoading(false);
        }
    };

    const handleUpdateConfig = async () => {
        setConfigLoading(true);
        setError(null);
        try {
            if (!world || !config) throw new Error("World not loaded");

            const newConfig = new Config(
                config.maxLtv,
                config.doveOracle,
                config.auctionConfig,
                config.debtConfig,
                new FlashMintConfig(newFeePercent / 100, newLimit),
                config.offeringConfig,
                config.savingsConfig,
                config.vaultConfig
            );

            await ledger.setConfig(newConfig);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setConfigLoading(false);
        }
    };

    return (
        <Card className="mt-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-cyan-900 to-blue-900 text-white">
                <CardTitle className="text-2xl">Flash Mint</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Current Configuration */}
                <div className="mb-6 p-4 bg-blue-700 rounded-lg">
                    <h3 className="text-lg text-blue-200 mb-2">
                        Current Configuration
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-blue-300">Fee Rate</p>
                            <p className="text-2xl font-bold text-blue-100">
                                {(currentFee * 100).toFixed(4)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-300">Mint Limit</p>
                            <p className="text-2xl font-bold text-blue-100">
                                {nf(currentLimit, 0)} DVD
                            </p>
                        </div>
                    </div>
                </div>

                {/* Flash Mint Action */}
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-lg text-gray-200 mb-4">Flash Mint DVD</h3>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="relative flex-1">
                                <Input
                                    type="number"
                                    value={mintAmount}
                                    onChange={(e) =>
                                        setMintAmount(Number(e.target.value))
                                    }
                                    placeholder="Amount to mint"
                                    className="pr-16 text-right"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-400">
                                    DVD
                                </span>
                            </div>
                            <Button
                                onClick={handleFlashMint}
                                disabled={mintLoading || mintAmount <= 0}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                            >
                                {mintLoading && (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                )}
                                Flash Mint
                            </Button>
                        </div>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={includeBegin}
                                    onChange={(e) => setIncludeBegin(e.target.checked)}
                                    className="rounded border-gray-600"
                                />
                                <span className="text-gray-200">Include Begin</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={includeEnd}
                                    onChange={(e) => setIncludeEnd(e.target.checked)}
                                    className="rounded border-gray-600"
                                />
                                <span className="text-gray-200">Include End</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Update Configuration */}
                <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-lg text-gray-200 mb-4">Update Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <Input
                                type="number"
                                value={newFeePercent}
                                onChange={(e) =>
                                    setNewFeePercent(Number(e.target.value))
                                }
                                placeholder="New fee rate"
                                className="pr-8 text-right"
                                step="0.0001"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-400">
                                %
                            </span>
                        </div>
                        <div className="relative">
                            <Input
                                type="number"
                                value={newLimit}
                                onChange={(e) => setNewLimit(Number(e.target.value))}
                                placeholder="New mint limit"
                                className="pr-16 text-right"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-400">
                                DVD
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={handleUpdateConfig}
                        disabled={configLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {configLoading && (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        )}
                        Update Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

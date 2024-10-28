import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { nf } from "@/lib/utils";
import { World } from "@/../pkg/dove";
import Ledger from "@/lib/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoveCache from "@/lib/cache/dove-cache";
import WorldCache from "@/lib/cache/world-cache";
import DvdCache from "@/lib/cache/dvd-cache";
import { Input } from "@/components/ui/input";

export default function OfferingInfo({
    worldCache,
    ledger,
    doveCache,
    dvdCache
}: {
    worldCache?: WorldCache;
    ledger: Ledger;
    doveCache?: DoveCache;
    dvdCache?: DvdCache;
}) {
    const [unixTimestamp, setUnixTimestamp] = useState(Math.floor(Date.now() / 1000));
    useEffect(() => {
        const interval = setInterval(() => {
            setUnixTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const world = worldCache?.world;
    const config = world?.config;
    const auctionConfig = config?.auctionConfig;
    const offeringConfig = config?.offeringConfig;
    const offering = world?.offering;
    const doveOfferingSize = offeringConfig?.doveOfferingSize || 0;
    const dvdOfferingSize = offeringConfig?.dvdOfferingSize || 0;
    const systemBalance = worldCache?.systemBalance || 0;
    const surplusLimit = offeringConfig?.surplusLimit || 0;
    const deficitLimit = offeringConfig?.deficitLimit || 0;
    const offeringIsActive = offering?.isActive;
    const offeringIsDvd = !!offering?.isDvd;
    const offeringPrice =
        (auctionConfig && offering?.getPrice(auctionConfig, unixTimestamp)) || 0;
    const offeringAmount = offering?.amount || 0;
    const offeringFailPrice =
        (auctionConfig && offering?.getFailPrice(auctionConfig)) || 0;

    const [startLoading, setStartLoading] = useState(false);
    const [endLoading, setEndLoading] = useState(false);
    const [buyLoading, setBuyLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [buyAmount, setBuyAmount] = useState<number>(0);

    const handleStartOffering = async () => {
        setStartLoading(true);
        setError(null);
        try {
            if (!world) throw new Error("World not loaded");
            await ledger.startOffering(world);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setStartLoading(false);
        }
    };

    const handleBuyOffering = async () => {
        setBuyLoading(true);
        setError(null);
        try {
            if (!world || !dvdCache || !doveCache) {
                throw new Error("Required data not loaded");
            }
            await ledger.buyOffering(buyAmount, world, dvdCache, doveCache);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBuyLoading(false);
        }
    };

    const handleEndOffering = async () => {
        setEndLoading(true);
        setError(null);
        try {
            await ledger.endOffering();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setEndLoading(false);
        }
    };

    return (
        <Card className="mt-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
                <CardTitle className="text-2xl">Offering Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Current Offering Status */}
                <div className="mb-6 p-4 bg-purple-700 rounded-lg">
                    <h3 className="text-lg text-purple-200 mb-2">
                        Current Offering Status
                    </h3>
                    {offeringIsActive ? (
                        <>
                            <p className="text-2xl sm:text-3xl font-bold text-purple-100">
                                {nf(offeringAmount || 0, offeringIsDvd ? 2 : 4)}{" "}
                                {offeringIsDvd ? "DVD" : "DOVE"}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-purple-100 mt-2">
                                at {nf(offeringPrice || 0, offeringIsDvd ? 4 : 2)} {offeringIsDvd ? "DOVE" : "DVD"} each
                            </p>
                            <p className="text-sm text-purple-300 mt-2">
                                Offering will end at ${nf(offeringFailPrice || 0, 2)}
                            </p>
                        </>
                    ) : (
                        <p className="text-xl font-semibold text-purple-100">
                            No active offering at the moment
                        </p>
                    )}
                </div>

                {/* System Balance */}
                <div
                    className="mb-6 p-4 bg-blue-700 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-600"
                    onClick={() => ledger?.invalidate([WorldCache])}
                >
                    <h3 className="text-lg text-blue-200 mb-2">
                        System {systemBalance >= 0 ? "Surplus" : "Deficit"}
                    </h3>
                    <p className="text-3xl font-bold text-blue-100">
                        {nf(Math.abs(systemBalance), 2)} DVD
                    </p>
                </div>
                {/* Offering Trigger Limits */}
                <div className="mb-6 p-4 bg-gradient-to-br from-green-700 to-teal-600 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-green-100 mb-4">
                        Offering Trigger Limits
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-green-600 p-3 rounded-lg">
                            <p className="text-sm text-green-200 mb-1">Surplus Limit</p>
                            <p className="text-2xl font-bold text-green-50">
                                {nf(surplusLimit, 0)} DVD
                            </p>
                        </div>
                        <div className="bg-teal-600 p-3 rounded-lg">
                            <p className="text-sm text-teal-200 mb-1">Deficit Limit</p>
                            <p className="text-2xl font-bold text-teal-50">
                                {nf(deficitLimit, 0)} DVD
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-green-200 mt-4 italic text-center">
                        An offering is triggered when the system balance exceeds these
                        limits
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <Button
                            onClick={handleStartOffering}
                            disabled={
                                startLoading ||
                                offeringIsActive ||
                                (systemBalance < surplusLimit &&
                                    systemBalance > -deficitLimit)
                            }
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {startLoading && (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            )}
                            Start Offering
                        </Button>
                        <Button
                            onClick={handleEndOffering}
                            disabled={
                                endLoading ||
                                !offeringIsActive ||
                                (offeringAmount > 0 && offeringPrice > offeringFailPrice)
                            }
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {endLoading && (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            )}
                            End Offering
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="relative flex-1">
                            <Input
                                type="number"
                                id="buyAmount"
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(Number(e.target.value))}
                                placeholder="Amount to buy"
                                className="pr-16 text-right"
                            />
                            <span 
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-400"
                                onClick={() => {
                                    const input = document.getElementById('buyAmount') as HTMLInputElement;
                                    if (input) {
                                        input.focus();
                                    }
                                }}
                            >
                                {offeringIsDvd ? "DOVE" : "DVD"}
                            </span>
                        </div>
                        <Button
                            onClick={handleBuyOffering}
                            disabled={buyLoading || buyAmount <= 0 || !offeringIsActive}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            {buyLoading && (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            )}
                            Buy Offering
                        </Button>
                    </div>
                </div>

                {/* Additional Parameters */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="bg-gray-700 p-3 rounded-lg flex-1">
                        <p className="text-sm text-gray-400 mb-1">DOVE Offering Size</p>
                        <p className="text-xl font-bold text-gray-200">
                            {nf(doveOfferingSize, 0)} DOVE
                        </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg flex-1">
                        <p className="text-sm text-gray-400 mb-1">DVD Offering Size</p>
                        <p className="text-xl font-bold text-gray-200">
                            {nf(dvdOfferingSize, 0)} DVD
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

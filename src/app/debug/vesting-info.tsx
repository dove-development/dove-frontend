import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { nf } from "@/lib/utils";
import { World } from "@/../pkg/dove";
import Ledger from "@/lib/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoveCache from "@/lib/cache/dove-cache";

export default function VestingInfo({
    world,
    ledger,
    doveCache
}: {
    world?: World;
    ledger: Ledger;
    doveCache?: DoveCache;
}) {
    const vesting = world?.vesting;
    const [unixTimestamp, setUnixTimestamp] = useState(Math.floor(Date.now() / 1000));
    useEffect(() => {
        const interval = setInterval(() => {
            setUnixTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const totalAvailableToClaim = vesting?.getEmissionDue(unixTimestamp) || 0;
    const totalDistributed = vesting?.distributed || 0;
    const maxDistribution = vesting?.schedule.totalEmission || 0;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const percentageDistributed = (totalDistributed / maxDistribution) * 100 || 0;

    const handleClaimVesting = async () => {
        if (!world || !doveCache) return;
        setLoading(true);
        setError(null);
        try {
            await ledger.claimVesting(world, doveCache);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mt-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Vesting Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-blue-300 mb-1">
                            Total Available to Claim
                        </p>
                        <p className="text-2xl font-medium text-blue-100">
                            {nf(totalAvailableToClaim, 4)} DOVE
                        </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-blue-300 mb-1">Total Distributed</p>
                        <p className="text-2xl font-medium text-blue-100">
                            {nf(totalDistributed, 4)} DOVE
                        </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-blue-300 mb-1">
                            Percentage Distributed
                        </p>
                        <p className="text-2xl font-medium text-blue-100">
                            {nf(percentageDistributed, 2)}%
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleClaimVesting}
                    disabled={loading || totalAvailableToClaim <= 0}
                    className="w-full py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 bg-blue-700 hover:bg-blue-600 text-blue-100"
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                    ) : null}
                    Claim Vested Tokens
                </Button>
            </CardContent>
        </Card>
    );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Asset } from "@/lib/structs/asset";
import WorldCache from "@/lib/cache/world-cache";
import CollateralCache from "@/lib/cache/collateral-cache";
import { nf } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import AssetCache from "@/lib/cache/asset-cache";
import { PublicKey } from "@solana/web3.js";
import Ledger from "@/lib/ledger";
import { Wallet } from "@/lib/wallet";

interface CollateralSetupProps {
    asset: Asset;
    wallet: Wallet;
    ledger: Ledger;
    index: number;
    worldCache?: WorldCache;
    collateralCache?: CollateralCache;
    assetCache?: AssetCache;
}

export default function CollateralSetup({
    asset,
    wallet,
    ledger,
    index,
    worldCache,
    collateralCache,
    assetCache
}: CollateralSetupProps) {
    const [newPrice, setNewPrice] = useState<string>("");
    const [newMaxDeposit, setNewMaxDeposit] = useState<string>("");
    const [loading, setLoading] = useState<string>("");
    const [error, setError] = useState<string>("");
    const assetInfo = assetCache?.get(asset);
    const collateralInfo = collateralCache?.get(asset);
    const maxDeposit = collateralCache?.get(asset)?.maxDeposit;

    const createCollateral = async () => {
        setLoading(`Creating ${asset.name} Collateral...`);
        setError("");
        try {
            if (
                asset.debugKeypair &&
                !(await wallet.getAccountData(asset.mint))?.length
            ) {
                await ledger.createMint({
                    name: asset.name,
                    symbol: asset.symbol,
                    decimals: 9,
                    initialSupply: Math.floor(Math.random() * 10 ** 9),
                    mintAuthority: PublicKey.default,
                    freezeAuthority: null,
                    updateAuthority: null,
                    createMetadata: false,
                    metadataUrl: "",
                    keypair: asset.debugKeypair
                });
            }
            await ledger.createCollateral(
                asset.mint,
                asset.pythOracle,
                100_000_000,
                asset.debugPrice,
                index
            );
        } catch (e: any) {
            console.error(e);
            setError(e.toString());
        } finally {
            setLoading("");
        }
    };

    const setCollateralPrice = async (price: number) => {
        setLoading(`Setting ${asset.name} Collateral Price...`);
        setError("");
        try {
            await ledger.setCollateralPrice(price, index);
        } catch (e: any) {
            setError(e.toString());
        } finally {
            setLoading("");
        }
    };

    const setCollateralMaxDeposit = async (maxDeposit: number) => {
        setLoading(`Setting ${asset.name} Max Deposit...`);
        setError("");
        try {
            await ledger.setCollateralMaxDeposit(maxDeposit, asset);
        } catch (e: any) {
            setError(e.toString());
        } finally {
            setLoading("");
        }
    };

    const setPythOracle = async () => {
        setLoading(`Setting ${asset.name} Pyth Oracle...`);
        setError("");
        try {
            await ledger.setCollateralOracleToPyth(
                asset.mint,
                asset.pythOracle || PublicKey.default
            );
        } catch (e: any) {
            setError(e.toString());
        } finally {
            setLoading("");
        }
    };

    return (
        <div className="bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-2 sm:mb-0">
                    {asset.name} Collateral
                </h3>
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto ${
                        collateralInfo
                            ? "bg-emerald-900 text-emerald-200"
                            : "bg-red-900 text-red-200"
                    }`}
                >
                    {collateralInfo ? "Created" : "Not Created"}
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                    <span className="text-sm font-medium text-gray-400">Price</span>
                    <p className="text-xl sm:text-2xl font-bold text-gray-100">
                        {nf(collateralInfo?.price || 0, 2) || "N/A"}
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <span className="text-sm font-medium text-gray-400">Balance</span>
                    <p className="text-xl sm:text-2xl font-bold text-gray-100">
                        {assetInfo ? nf(assetInfo.balance, 2) : "N/A"}
                    </p>
                </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 mb-4 sm:mb-6">
                <span className="text-sm font-medium text-gray-400">Max Deposit</span>
                <p className="text-xl sm:text-2xl font-bold text-gray-100">
                    {maxDeposit ? nf(maxDeposit, 2) : "N/A"}
                </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                <Button
                    onClick={createCollateral}
                    disabled={!!loading || !worldCache || !!collateralInfo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                >
                    {loading === `Creating ${asset.name} Collateral...` ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Collateral
                </Button>
                <div className="bg-gray-800 rounded-lg px-4 py-2 text-sm w-full sm:w-auto text-center sm:text-left">
                    <span className="font-medium text-gray-400">Token Account:</span>{" "}
                    <span className="text-gray-100">
                        {assetInfo ? (assetInfo.hasTokenAccount ? "Yes" : "No") : "N/A"}
                    </span>
                </div>
            </div>
            <div className="flex flex-col space-y-4 mb-4">
                <div className="flex items-center space-x-2">
                    <Input
                        type="number"
                        placeholder="New Price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full sm:w-32 bg-gray-800 border-gray-700 text-gray-100"
                    />
                    <Button
                        onClick={() => {
                            const price = parseFloat(newPrice);
                            if (!isNaN(price)) {
                                setCollateralPrice(price);
                                setNewPrice("");
                            }
                        }}
                        disabled={!!loading || !collateralInfo}
                        className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
                    >
                        {loading === `Setting ${asset.name} Collateral Price...` ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Set Price
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        type="number"
                        placeholder="New Max Deposit"
                        value={newMaxDeposit}
                        onChange={(e) => setNewMaxDeposit(e.target.value)}
                        className="w-full sm:w-32 bg-gray-800 border-gray-700 text-gray-100"
                    />
                    <Button
                        onClick={() => {
                            const maxDeposit = parseFloat(newMaxDeposit);
                            if (!isNaN(maxDeposit)) {
                                setCollateralMaxDeposit(maxDeposit);
                                setNewMaxDeposit("");
                            }
                        }}
                        disabled={!!loading || !collateralInfo}
                        className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                    >
                        {loading === `Setting ${asset.name} Max Deposit...` ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Set Max Deposit
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => {
                            setPythOracle();
                        }}
                        disabled={!!loading || !collateralInfo}
                        className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
                    >
                        {loading === `Setting ${asset.name} Pyth Oracle...` ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Set Pyth Oracle
                    </Button>
                </div>
            </div>
            {error && (
                <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
        </div>
    );
}

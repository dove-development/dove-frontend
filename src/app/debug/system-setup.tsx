import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SetupButton from "./setup-button";
import CollateralSetup from "./collateral-setup";
import StabilitySetup from "./stability-setup";
import RequestAirdrop from "./request-airdrop";
import { Asset } from "@/lib/structs/asset";
import Stablecoin from "@/lib/structs/stablecoin";
import { PublicKey } from "@solana/web3.js";
import WorldCache from "@/lib/cache/world-cache";
import AuthorityCache from "@/lib/cache/authority-cache";
import CollateralCache from "@/lib/cache/collateral-cache";
import AssetCache from "@/lib/cache/asset-cache";
import StabilityCache from "@/lib/cache/stability-cache";
import Ledger from "@/lib/ledger";
import { unwrap } from "@/lib/utils";

interface SystemSetupProps {
    createMetadata: boolean;
    setCreateMetadata: (value: boolean) => void;
    wallet: any;
    dvdMint?: PublicKey;
    doveMint?: PublicKey;
    worldCache?: WorldCache;
    authorityCache?: AuthorityCache;
    collateralCache?: CollateralCache;
    assetCache?: AssetCache;
    stabilityCache?: StabilityCache;
    ledger: Ledger;
    authorityKey?: PublicKey;
    setDvdMint: (mint: PublicKey) => void;
    setDoveMint: (mint: PublicKey) => void;
}

export default function SystemSetup({
    createMetadata,
    setCreateMetadata,
    wallet,
    dvdMint,
    doveMint,
    worldCache,
    authorityCache,
    collateralCache,
    assetCache,
    stabilityCache,
    ledger,
    authorityKey,
    setDvdMint,
    setDoveMint
}: SystemSetupProps) {
    async function createDvdMint() {
        const authority = unwrap(authorityKey, "Authority key not found");
        const pubkey = unwrap(wallet.pubkey, "Wallet not connected");
        const mint = await ledger.createMint({
            name: "Dove USD",
            symbol: "DVD",
            decimals: 9,
            initialSupply: 0,
            mintAuthority: authority,
            freezeAuthority: null,
            updateAuthority: pubkey,
            createMetadata: createMetadata,
            metadataUrl: ""
        });
        setDvdMint(mint);
    }

    async function createDoveMint() {
        const authority = unwrap(authorityKey, "Authority key not found");
        const pubkey = unwrap(wallet.pubkey, "Wallet not connected");
        const mint = await ledger.createMint({
            name: "Dove",
            symbol: "DOVE",
            decimals: 9,
            initialSupply: 0,
            mintAuthority: authority,
            freezeAuthority: null,
            updateAuthority: pubkey,
            createMetadata: createMetadata,
            metadataUrl: ""
        });
        setDoveMint(mint);
    }

    async function createWorld() {
        if (!dvdMint || !doveMint) {
            throw new Error("DVD and DOVE mints must be created first");
        }
        await ledger.createWorld(dvdMint, doveMint);
    }

    async function createAuthority() {
        await ledger.createAuthority();
    }

    return (
        <Card className="mb-8 shadow-lg bg-gray-800 border-gray-700">
            <CardHeader className="bg-gradient-to-r from-green-900 to-teal-900 text-white">
                <CardTitle className="text-xl sm:text-2xl">System Setup</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <input
                            type="checkbox"
                            id="createMetadata"
                            checked={createMetadata}
                            onChange={(e) => setCreateMetadata(e.target.checked)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label
                            htmlFor="createMetadata"
                            className="text-xs sm:text-sm font-medium text-gray-300"
                        >
                            Create metadata with token
                        </label>
                    </div>
                    <div className="flex items-center">
                        <RequestAirdrop disabled={!wallet.pubkey} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <SetupButton
                        onClick={createDvdMint}
                        disabled={!!dvdMint || !!worldCache}
                        text="Create DVD Mint"
                        status={dvdMint ? "created" : "not-created"}
                    />
                    <SetupButton
                        onClick={createDoveMint}
                        disabled={!!doveMint || !!worldCache}
                        text="Create DOVE Mint"
                        status={doveMint ? "created" : "not-created"}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <SetupButton
                        onClick={createAuthority}
                        disabled={!!authorityCache}
                        text="Create Authority"
                        status={authorityCache ? "created" : "not-created"}
                    />
                    <SetupButton
                        onClick={createWorld}
                        disabled={!dvdMint || !doveMint || !!worldCache}
                        text="Create World"
                        status={worldCache ? "created" : "not-created"}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Asset.LIST.map((asset, index) => (
                        <CollateralSetup
                            key={asset.symbol}
                            asset={asset}
                            index={index}
                            worldCache={worldCache}
                            collateralCache={collateralCache}
                            assetCache={assetCache}
                            wallet={wallet}
                            ledger={ledger}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Stablecoin.LIST.filter(
                        (stablecoin) => stablecoin.hasStability
                    ).map((stablecoin) => (
                        <StabilitySetup
                            key={stablecoin.symbol}
                            stablecoin={stablecoin}
                            wallet={wallet}
                            ledger={ledger}
                            worldCache={worldCache}
                            stabilityCache={stabilityCache}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

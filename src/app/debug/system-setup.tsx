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
import MintButton from "./mint-button";
import StablecoinCache from "@/lib/cache/stablecoin-cache";

interface SystemSetupProps {
    createMetadata: boolean;
    setCreateMetadata: (value: boolean) => void;
    wallet: any;
    dvdMint?: PublicKey;
    doveMint?: PublicKey;
    worldCache?: WorldCache;
    authorityCache?: AuthorityCache;
    collateralCache?: CollateralCache;
    stablecoinCache?: StablecoinCache;
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
    stablecoinCache,
    assetCache,
    stabilityCache,
    ledger,
    authorityKey,
    setDvdMint,
    setDoveMint
}: SystemSetupProps) {
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
            <CardHeader className="bg-gradient-to-r from-green-900 to-teal-900 text-white rounded-t-lg">
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
                    <MintButton
                        name="Dove USD"
                        symbol="DVD"
                        decimals={9}
                        initialSupply={0}
                        disabled={!!worldCache}
                        created={!!dvdMint}
                        createMetadata={createMetadata}
                        wallet={wallet}
                        authorityKey={authorityKey}
                        ledger={ledger}
                        onMintCreated={setDvdMint}
                    />
                    <MintButton
                        name="Dove"
                        symbol="DOVE"
                        decimals={9}
                        initialSupply={0}
                        disabled={!!worldCache}
                        created={!!doveMint}
                        createMetadata={createMetadata}
                        wallet={wallet}
                        authorityKey={authorityKey}
                        ledger={ledger}
                        onMintCreated={setDoveMint}
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
                    {Stablecoin.LIST.filter(x => !x.hasStability).map((stablecoin) => (
                        <MintButton
                            name={stablecoin.name}
                            key={stablecoin.symbol}
                            symbol={stablecoin.symbol}
                            decimals={9}
                            initialSupply={Math.floor(Math.random() * 10 ** 9)}
                            disabled={!worldCache || !stablecoinCache}
                            created={!!stablecoinCache?.get(stablecoin)}
                            createMetadata={createMetadata}
                            wallet={wallet}
                            authorityKey={authorityKey}
                            ledger={ledger}
                            onMintCreated={() => {}}
                            keypair={stablecoin.debugKeypair}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Stablecoin.LIST.filter(x => x.hasStability).map((stablecoin) => (
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

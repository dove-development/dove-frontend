import { Wallet } from "@/lib/wallet";
import { unwrap, zip } from "../utils";
import { Decimal } from "../../../pkg/dove";
import { Asset } from "../structs/asset";
import CollateralCache from "./collateral-cache";
import { HashMap } from "../structs/hash-map";

type AssetInfo = {
    balance: number;
    hasTokenAccount: boolean;
};

export default class AssetCache extends HashMap<Asset, AssetInfo> {
    public static readonly userDependent: boolean = true;

    private constructor() {
        super();
    }

    public static getHashCode(): string {
        return "asset-cache";
    }

    public static mock(): AssetCache {
        const cache = new AssetCache();
        Asset.LIST.forEach((asset) =>
            cache.insert(asset, {
                balance: 0,
                hasTokenAccount: false
            })
        );
        return cache;
    }

    public static async fetch(
        wallet: Wallet,
        [assetInfo]: [CollateralCache]
    ): Promise<AssetCache> {
        const cache = new AssetCache();
        const pubkey = wallet.pubkey;
        if (!pubkey) {
            return AssetCache.mock();
        }
        const accounts = await Promise.all(
            Asset.LIST.map(async (asset) => {
                if (asset.isNative) {
                    const [balance, account] = await Promise.all([
                        wallet.getAccountBalance(pubkey),
                        wallet.getAssociatedTokenAccount(asset.mint)
                    ]);
                    return {
                        balance,
                        hasTokenAccount: !!account
                    };
                }
                const account = await wallet.getAssociatedTokenAccount(asset.mint);
                const decimals = unwrap(
                    assetInfo.get(asset)?.decimals,
                    `Can't find collateral data for ${asset.symbol}`
                );
                return {
                    balance: account
                        ? Decimal.tokenAmountToNumber(account.amount, decimals)
                        : 0,
                    hasTokenAccount: !!account
                };
            })
        );

        for (const [asset, account] of zip(Asset.LIST, accounts)) {
            cache.insert(asset, account);
        }

        return cache;
    }
}

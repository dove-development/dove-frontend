import { PublicKey } from "@solana/web3.js";
import { Collateral } from "@/../pkg/dove";
import { DOVE_PROGRAM_ID } from "@/lib/constants";
import { unwrap, zip } from "@/lib/utils";
import { Wallet } from "@/lib/wallet";
import { Asset } from "../structs/asset";
import { HashMap } from "../structs/hash-map";

type CollateralInfo = {
    deposited: number;
    decimals: number;
    price: number;
    isPriceStale: boolean;
    maxDeposit: number;
    oracleKey: PublicKey;
};

export default class CollateralCache extends HashMap<Asset, CollateralInfo> {
    public static readonly userDependent: boolean = false;

    public static getHashCode(): string {
        return "collateral-cache";
    }

    public static mock(): CollateralCache {
        const cache = new CollateralCache();

        Asset.LIST.forEach((asset) => {
            cache.insert(asset, {
                deposited: 1_000_000,
                decimals: 6,
                price: 1.0,
                isPriceStale: false,
                oracleKey: new PublicKey("11111111111111111111111111111111"),
                maxDeposit: 2_000_000
            });
        });

        return cache;
    }

    public static async fetch(wallet: Wallet): Promise<CollateralCache> {
        const unixTimestamp = Math.floor(Date.now() / 1000);
        const cache = new CollateralCache();

        const fetchCollateral = async (asset: Asset) => {
            const { mint } = asset;
            const collateralKey = new PublicKey(
                Collateral.deriveKey(
                    DOVE_PROGRAM_ID.toBuffer(),
                    new PublicKey(mint).toBuffer()
                )
            );
            const collateralData = await wallet.getAccountData(collateralKey);
            if (!collateralData) {
                return undefined;
            }
            const collateral = Collateral.fromBytes(collateralData);

            const oracle = collateral.oracle;
            const oracleKey = new PublicKey(oracle.key);
            console.log("oracleKey", oracleKey.toBase58());
            const oracleInfo = await wallet.getAccountInfo(oracleKey);
            const oracleData = oracleInfo?.data;
            const oracleOwner = oracleInfo?.owner;
            const price = oracle.getPriceNegativeIfStale(
                oracleKey.toBuffer(),
                oracleData || new Uint8Array(),
                oracleOwner?.toBuffer() || new Uint8Array(),
                unixTimestamp
            );

            return {
                deposited: collateral.deposited,
                decimals: collateral.decimals,
                price: Math.abs(price),
                isPriceStale: price < 0,
                oracleKey,
                maxDeposit: collateral.maxDeposit
            };
        };

        const results = await Promise.all(Asset.LIST.map(fetchCollateral));
        for (const [asset, info] of zip(Asset.LIST, results)) {
            if (!info) {
                continue;
            }
            cache.insert(asset, info);
        }

        return cache;
    }
}

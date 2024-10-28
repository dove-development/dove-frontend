import { Wallet } from "@/lib/wallet";
import { unwrap, zip } from "../utils";
import { Decimal } from "../../../pkg/dove";
import Stablecoin from "../structs/stablecoin";
import { HashMap } from "../structs/hash-map";

type StablecoinInfo = {
    balance: number;
    hasTokenAccount: boolean;
};

export default class StablecoinCache extends HashMap<Stablecoin, StablecoinInfo> {
    public static readonly userDependent: boolean = true;
    public static getHashCode(): string {
        return "stablecoin-cache";
    }
    public static mock(): StablecoinCache {
        const cache = new StablecoinCache();
        Stablecoin.LIST.forEach((stablecoin) => {
            cache.insert(stablecoin, { balance: 0, hasTokenAccount: false });
        });
        return cache;
    }
    public static async fetch(wallet: Wallet): Promise<StablecoinCache> {
        const cache = new StablecoinCache();
        if (!wallet.pubkey) {
            return StablecoinCache.mock();
        }
        const [mints, accounts] = await Promise.all([
            Promise.all(Stablecoin.LIST.map((c) => wallet.getMint(c.mint))),
            Promise.all(
                Stablecoin.LIST.map((c) => wallet.getAssociatedTokenAccount(c.mint))
            )
        ]);

        for (const [[stablecoin, mintMaybe], account] of zip(
            zip(Stablecoin.LIST, mints),
            accounts
        )) {
            const mint = unwrap(mintMaybe, `Can't find mint for ${stablecoin.symbol}`);
            const balance = account
                ? Decimal.tokenAmountToNumber(account.amount, mint.decimals)
                : 0;
            cache.insert(stablecoin, { balance, hasTokenAccount: !!account });
        }
        return cache;
    }
}

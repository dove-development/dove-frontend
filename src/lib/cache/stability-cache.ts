import { PublicKey } from "@solana/web3.js";
import { Stability } from "../../../pkg/dove";
import { DOVE_PROGRAM_ID } from "../constants";
import { Wallet } from "../wallet";
import { HashMap } from "../structs/hash-map";
import Stablecoin from "../structs/stablecoin";

export default class StabilityCache extends HashMap<Stablecoin, Stability> {
    public static readonly userDependent: boolean = false;
    private constructor() {
        super();
    }
    public static getHashCode(): string {
        return "stability-cache";
    }
    public static mock(): StabilityCache {
        return new StabilityCache();
    }
    public static async fetch(wallet: Wallet): Promise<StabilityCache> {
        const cache = new StabilityCache();
        await Promise.all(
            Stablecoin.LIST.map(async (stablecoin) => {
                const stabilityKey = Stability.deriveKey(
                    DOVE_PROGRAM_ID.toBuffer(),
                    stablecoin.mint.toBuffer()
                );
                const accountData = await wallet.getAccountData(
                    new PublicKey(stabilityKey)
                );
                if (!accountData) {
                    return;
                }
                const stability = Stability.fromBytes(accountData);
                cache.insert(stablecoin, stability);
            })
        );
        return cache;
    }
}

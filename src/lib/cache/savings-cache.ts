import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../wallet";
import { Savings } from "@/../pkg/dove";
import { DOVE_PROGRAM_ID } from "../constants";
import { unwrap } from "../utils";
import WorldCache from "./world-cache";

export class SavingsCache {
    public readonly savings: Savings | undefined;
    public readonly total: number;
    public readonly rewards: number;

    public static readonly userDependent: boolean = true;
    public static getHashCode(): string {
        return "savings-cache";
    }
    constructor(savings: Savings | undefined, total: number, rewards: number) {
        this.savings = savings;
        this.total = total;
        this.rewards = rewards;
    }
    private static EMPTY = new SavingsCache(undefined, 0, 0);
    static mock(): SavingsCache {
        return SavingsCache.EMPTY;
    }
    static async fetch(
        wallet: Wallet,
        [{ world }]: [WorldCache]
    ): Promise<SavingsCache> {
        if (!wallet.pubkey) {
            return SavingsCache.EMPTY;
        }
        const savingsData = await wallet.getAccountData(
            new PublicKey(
                Savings.deriveKey(DOVE_PROGRAM_ID.toBuffer(), wallet.pubkey.toBuffer())
            )
        );
        if (!savingsData) {
            return SavingsCache.EMPTY;
        }
        const savings = Savings.fromBytes(savingsData);
        const page = savings.page;
        const unixTimestamp = Math.floor(new Date().getTime() / 1000);
        const total = page.projectTotal(
            world.savings,
            world.config.savingsConfig,
            unixTimestamp
        );
        const rewards = page.projectRewards(world.savings, unixTimestamp);
        return new SavingsCache(savings, total, rewards);
    }
}

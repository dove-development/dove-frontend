import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../wallet";
import { Decimal } from "../../../pkg/dove";
import WorldCache from "./world-cache";

export default class DoveCache {
    public readonly balance: number;
    public readonly hasTokenAccount: boolean;

    public static readonly userDependent: boolean = true;
    public static getHashCode(): string {
        return "dove-cache";
    }
    private constructor(balance: number, hasTokenAccount: boolean) {
        this.balance = balance;
        this.hasTokenAccount = hasTokenAccount;
    }
    public static mock(): DoveCache {
        return new DoveCache(1000, true);
    }
    public static async fetch(
        wallet: Wallet,
        [{ world }]: [WorldCache]
    ): Promise<DoveCache> {
        const doveMint = new PublicKey(world.dove.mint);
        const account = await wallet.getAssociatedTokenAccount(doveMint);
        const decimals = world.dove.decimals;

        return new DoveCache(
            account ? Decimal.tokenAmountToNumber(account.amount, decimals) : 0,
            !!account
        );
    }
}

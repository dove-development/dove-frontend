import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../wallet";
import { Decimal } from "../../../pkg/dove";
import WorldCache from "./world-cache";

export default class DvdCache {
    public readonly balance: number;
    public readonly hasTokenAccount: boolean;

    public static readonly userDependent: boolean = true;
    public static getHashCode(): string {
        return "dvd-cache";
    }
    private constructor(balance: number, hasTokenAccount: boolean) {
        this.balance = balance;
        this.hasTokenAccount = hasTokenAccount;
    }
    public static mock(): DvdCache {
        return new DvdCache(1000, true);
    }
    public static async fetch(
        wallet: Wallet,
        [{ world }]: [WorldCache]
    ): Promise<DvdCache> {
        const dvdMint = new PublicKey(world.dvd.mint);
        const account = await wallet.getAssociatedTokenAccount(dvdMint);
        const decimals = world.dvd.decimals;

        return new DvdCache(
            account ? Decimal.tokenAmountToNumber(account.amount, decimals) : 0,
            !!account
        );
    }
}

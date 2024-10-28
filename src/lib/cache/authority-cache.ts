import { PublicKey } from "@solana/web3.js";
import { Authority } from "../../../pkg/dove";
import { DOVE_PROGRAM_ID } from "../constants";
import { Wallet } from "../wallet";

export default class AuthorityCache {
    public static readonly userDependent: boolean = false;
    private constructor() {}
    public static getHashCode(): string {
        return "authority-cache";
    }
    public static mock(): AuthorityCache {
        return new AuthorityCache();
    }
    public static async fetch(wallet: Wallet): Promise<AuthorityCache> {
        const authorityKey = Authority.deriveKey(DOVE_PROGRAM_ID.toBuffer());
        if (!authorityKey) {
            throw new Error("Failed to derive authority key");
        }
        const accountData = await wallet.getAccountData(new PublicKey(authorityKey));
        if (!accountData?.length) {
            throw new Error("Can't find authority");
        }
        return new AuthorityCache();
    }
}

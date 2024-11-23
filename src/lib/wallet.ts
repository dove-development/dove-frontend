import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import {
    AccountInfo,
    Connection,
    PublicKey,
    Transaction,
    VersionedTransaction
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { lamportsToSol, sleep, solToLamports, unwrap } from "./utils";
import {
    Account,
    getAssociatedTokenAddressSync,
    Mint,
    TOKEN_PROGRAM_ID,
    unpackAccount,
    unpackMint
} from "@solana/spl-token";

export class Wallet {
    public readonly connected: boolean;
    public readonly connection: Connection;
    public readonly pubkey?: PublicKey;

    public readonly contextState: WalletContextState;
    public readonly setShowModal: (show: boolean) => void;
    public readonly minSlot: number;

    constructor(
        contextState: WalletContextState,
        connection: Connection,
        setShowModal: (show: boolean) => void
    ) {
        const { publicKey, connected } = contextState;
        this.connected = connected;
        this.connection = connection;
        this.pubkey = publicKey || undefined;
        this.contextState = contextState;
        this.setShowModal = setShowModal;
        this.minSlot = 0;
    }

    private async confirmTransaction(signature: string, lastValidBlockHeight: number) {
        if (!this.connection) {
            throw new Error("No connection");
        }
        while (true) {
            const [status, blockHeight] = await Promise.all([
                this.connection.getSignatureStatus(signature),
                this.connection.getBlockHeight()
            ]);
            if (blockHeight > lastValidBlockHeight) {
                throw new Error("Transaction expired (block height exceeded)");
            }
            const err = status.value?.err;
            if (err) {
                throw new Error("Transaction failed: " + err);
            }
            if (status.value?.confirmationStatus === "confirmed") {
                return;
            }
            await sleep(1000);
        }
    }

    async requestAirdrop(pubkey: PublicKey, amount: number): Promise<string> {
        if (!this.connection) {
            throw new Error("No connection");
        }
        const { lastValidBlockHeight } = await this.connection.getLatestBlockhash();
        const signature = await this.connection.requestAirdrop(
            pubkey,
            solToLamports(amount)
        );
        await this.confirmTransaction(signature, lastValidBlockHeight);
        return signature;
    }

    async getAccountData(pubkey: PublicKey): Promise<Buffer | null> {
        if (!this.connection) {
            throw new Error("No connection");
        }
        const accountInfo = await this.connection.getAccountInfo(pubkey);
        if (!accountInfo) {
            return null;
        }
        return accountInfo.data;
    }

    async getAccountInfo(pubkey: PublicKey): Promise<AccountInfo<Buffer> | null> {
        if (!this.connection) {
            throw new Error("No connection");
        }
        return await this.connection.getAccountInfo(pubkey);
    }

    async getMint(mint: PublicKey): Promise<Mint | null> {
        const info = await this.connection.getAccountInfo(mint);
        if (!info) {
            return null;
        }
        return unpackMint(mint, info);
    }

    async getAssociatedTokenAccount(mint: PublicKey): Promise<Account | null> {
        if (!this.pubkey) {
            return null;
        }
        const address = getAssociatedTokenAddressSync(mint, this.pubkey);
        const info = await this.connection.getAccountInfo(address);
        if (!info) {
            return null;
        }
        return unpackAccount(address, info);
    }

    async getAccountBalance(pubkey: PublicKey): Promise<number> {
        if (!this.connection) {
            throw new Error("No connection");
        }
        const balance = await this.connection.getAccountInfo(pubkey);
        return lamportsToSol(balance?.lamports || 0);
    }

    async sendAndConfirmTransaction(
        transaction: Transaction | VersionedTransaction,
        options?: SendTransactionOptions,
        lastValidBlockHeight?: number,
        recentBlockhash?: string
    ): Promise<string> {
        const connection = unwrap(this.connection, "No connection");
        const signTransaction = unwrap(
            this.contextState.signTransaction,
            "No signTransaction function"
        );
        const pubkey = unwrap(this.pubkey, "No pubkey");

        if (!lastValidBlockHeight || !recentBlockhash) {
            const resp = await connection.getLatestBlockhash();
            lastValidBlockHeight = resp.lastValidBlockHeight;
            recentBlockhash = resp.blockhash;
        }
        if (transaction instanceof Transaction) {
            transaction.recentBlockhash = recentBlockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            if (!transaction.feePayer) {
                transaction.feePayer = pubkey;
            }
        } else {
            transaction.message.recentBlockhash = recentBlockhash;
        }

        const signers = options?.signers || [];
        if (signers.length > 0) {
            (transaction.sign as Function)(...signers);
        }
        transaction = await signTransaction(transaction);
        const rawTransaction = transaction.serialize();
        let signature: string;
        try {
            signature = await connection.sendRawTransaction(rawTransaction, options);
        } catch (e) {
            if (e instanceof Error) {
                console.log(e);
                let s = e.message.match(
                    /panicked at ([^:]+):(\d+):(\d+):\s*(.+?)(?="|$)/
                );
                if (s && s.length > 4) {
                    let [_, file, line, col, msg] = s;
                    msg = msg || "";
                    msg = msg.replaceAll("\\n", "").trim();
                    throw new Error(
                        `Reverted: ${msg} (${file}, line ${line}, col ${col})`
                    );
                }
                s = e.message.match(/Program log: Error: ([^"]+)/);
                if (s && s.length > 1) {
                    let msg = s[1] || "";
                    msg = msg.charAt(0).toUpperCase() + msg.slice(1);
                    s = e.message.match(/Program log: Instruction: ([^"]+)/);
                    if (s && s.length > 1) {
                        msg = `${s[1]} failed: ${msg}`;
                    }
                    throw new Error(msg);
                }
            }
            throw e;
        }
        await this.confirmTransaction(signature, lastValidBlockHeight);
        return signature;
    }
}

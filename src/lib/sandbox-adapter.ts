import { PublicKey } from "@solana/web3.js";
import type { WalletName } from "@solana/wallet-adapter-base";
import {
    BaseSignInMessageSignerWalletAdapter,
    WalletReadyState
} from "@solana/wallet-adapter-base";
import {
    type SolanaSignInInput,
    type SolanaSignInOutput
} from "@solana/wallet-standard-features";
import type {
    Transaction,
    TransactionVersion,
    VersionedTransaction
} from "@solana/web3.js";

export const SandboxWalletName = "Sandbox Wallet" as WalletName<"Sandbox Wallet">;

export default class SandboxWalletAdapter extends BaseSignInMessageSignerWalletAdapter {
    name = SandboxWalletName;
    url = "https://example.com/sandbox-wallet";
    icon =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2U2ZTZlNiIvPjwvc3ZnPg==";
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set([
        "legacy",
        0
    ] as TransactionVersion[]);

    private _publicKey: PublicKey = new PublicKey("11111111111111111111111111111111");

    constructor() {
        super();
    }

    get connecting() {
        return false;
    }

    get publicKey() {
        return this._publicKey;
    }

    get readyState() {
        return WalletReadyState.Installed;
    }

    async connect(): Promise<void> {
        this.emit("connect", this._publicKey);
    }

    async disconnect(): Promise<void> {
        this.emit("disconnect");
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T
    ): Promise<T> {
        return transaction;
    }

    async signAllTransactions<T extends Transaction | VersionedTransaction>(
        transactions: T[]
    ): Promise<T[]> {
        return transactions;
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        return new Uint8Array(64); // Return a dummy signature
    }

    async signIn(input: SolanaSignInInput = {}): Promise<SolanaSignInOutput> {
        return {
            account: {
                address: this._publicKey.toBase58(),
                publicKey: this._publicKey.toBytes(),
                chains: [],
                features: []
            },
            signedMessage: new Uint8Array(0),
            signature: new Uint8Array(64)
        };
    }
}

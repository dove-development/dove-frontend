import { PublicKey, Keypair } from "@solana/web3.js";
import SetupButton from "./setup-button";
import Ledger from "@/lib/ledger";
import { unwrap } from "@/lib/utils";

interface MintButtonProps {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
    disabled: boolean;
    created: boolean;
    createMetadata: boolean;
    metadataUrl?: string;
    wallet: any;
    authorityKey?: PublicKey;
    ledger: Ledger;
    keypair?: Keypair;
    onMintCreated: (mint: PublicKey) => void;
}

export default function MintButton({
    name,
    symbol,
    decimals,
    initialSupply,
    disabled,
    created,
    createMetadata,
    metadataUrl = "",
    wallet,
    authorityKey,
    ledger,
    keypair,
    onMintCreated
}: MintButtonProps) {
    async function createMint() {
        const authority = unwrap(authorityKey, "Authority key not found");
        const pubkey = unwrap(wallet.pubkey, "Wallet not connected");
        const mint = await ledger.createMint({
            name,
            symbol,
            decimals,
            initialSupply,
            mintAuthority: authority,
            freezeAuthority: null,
            updateAuthority: pubkey,
            createMetadata,
            metadataUrl,
            keypair
        });
        onMintCreated(mint);
    }

    return (
        <SetupButton
            onClick={createMint}
            disabled={disabled || created}
            text={`Create ${symbol} Mint`}
            status={created ? "created" : "not-created"}
        />
    );
}

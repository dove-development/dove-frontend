"use client";

import { Wallet } from "@/lib/wallet";
import { useWallet } from "../providers/wallet-provider";
import {
    AddressLookupTableAccount,
    PublicKey,
    TransactionError,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";
import { IOnRequestIxCallback, SwapResult } from "@/types/jupiter-terminal";
import { unwrap, zip } from "@/lib/utils";
import { ButtonProps } from "../ui/button";
import { useEffect } from "react";

async function processJupiterTransaction(
    wallet: Wallet,
    ixAndCb: IOnRequestIxCallback
) {
    const { meta, instructions, onSubmitWithIx } = ixAndCb;
    const {
        setupInstructions,
        swapInstruction: swapInstructionPayload,
        cleanupInstruction,
        addressLookupTableAddresses
    } = instructions;

    const pubkey = unwrap(wallet.pubkey, "Wallet not connected");
    const connection = unwrap(wallet.connection, "No connection");

    const deserializeInstruction = (instruction: typeof swapInstructionPayload) => {
        return new TransactionInstruction({
            programId: new PublicKey(instruction.programId),
            keys: instruction.accounts.map((key) => ({
                pubkey: new PublicKey(key.pubkey),
                isSigner: key.isSigner,
                isWritable: key.isWritable
            })),
            data: Buffer.from(instruction.data, "base64")
        });
    };

    const getAddressLookupTableAccounts = async (
        keys: string[]
    ): Promise<AddressLookupTableAccount[]> => {
        const addressLookupTableAccountInfos = await connection.getMultipleAccountsInfo(
            keys.map((key) => new PublicKey(key))
        );
        const result = new Array<AddressLookupTableAccount>();
        for (const [accountInfo, addressLookupTableAddress] of zip(
            addressLookupTableAccountInfos,
            keys
        )) {
            if (accountInfo) {
                const addressLookupTableAccount = new AddressLookupTableAccount({
                    key: new PublicKey(addressLookupTableAddress),
                    state: AddressLookupTableAccount.deserialize(accountInfo.data)
                });
                result.push(addressLookupTableAccount);
            }
        }
        return result;
    };

    const addressLookupTableAccounts = await getAddressLookupTableAccounts(
        addressLookupTableAddresses
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
        payerKey: pubkey,
        recentBlockhash: blockhash,
        instructions: [
            ...setupInstructions.map(deserializeInstruction),
            deserializeInstruction(swapInstructionPayload),
            cleanupInstruction ? deserializeInstruction(cleanupInstruction) : null
        ].filter(Boolean) as TransactionInstruction[]
    }).compileToV0Message(addressLookupTableAccounts);

    const transaction = new VersionedTransaction(messageV0);

    try {
        const signature = await wallet.sendAndConfirmTransaction(
            transaction,
            {
                skipPreflight: true,
                maxRetries: 2
            },
            lastValidBlockHeight,
            blockhash
        );

        const swapResult: SwapResult = {
            txid: signature,
            inputAddress: meta.sourceAddress,
            outputAddress: meta.destinationAddress,
            inputAmount: meta.quoteResponseMeta.inAmount,
            outputAmount: meta.quoteResponseMeta.outAmount
        };

        onSubmitWithIx(swapResult);
    } catch (error) {
        onSubmitWithIx({ error: error as TransactionError });
    }
}

function launchJupiter(
    wallet: Wallet,
    close: () => void,
    inputMint?: PublicKey,
    outputMint?: PublicKey,
    onSuccess?: () => void
) {
    const Jupiter = window.Jupiter;
    if (!Jupiter) return;
    Jupiter.init({
        connectionObj: wallet.connection,
        formProps: {
            fixedInputMint: false,
            initialInputMint: inputMint?.toBase58(),
            fixedOutputMint: false,
            initialOutputMint: outputMint?.toBase58()
        },
        enableWalletPassthrough: true,
        passthroughWalletContextState: wallet.contextState,
        onRequestConnectWallet: () => wallet.setShowModal(true),
        onSuccess: () => {
            close();
            onSuccess?.();
        },
        onSwapError: () => close?.(),
        onRequestIxCallback: (ixAndCb) => processJupiterTransaction(wallet, ixAndCb)
    });
}

function closeJupiter() {
    const Jupiter = window.Jupiter;
    if (!Jupiter) return;
    Jupiter.close();
}

export function JupiterDialog({
    open,
    close,
    inputMint,
    outputMint,
    onSuccess
}: {
    open: boolean;
    close: () => void;
    inputMint?: PublicKey | string;
    outputMint?: PublicKey | string;
    onSuccess?: () => void;
}) {
    const wallet = useWallet();
    if (typeof outputMint === "string") {
        outputMint = new PublicKey(outputMint);
    }
    if (typeof inputMint === "string") {
        inputMint = new PublicKey(inputMint);
    }
    if (!inputMint && !outputMint) {
        throw new Error("Either inputMint or outputMint must be provided");
    }

    useEffect(() => {
        if (open) {
            launchJupiter(wallet, close, inputMint, outputMint, onSuccess);
        } else {
            closeJupiter();
        }
    }, [open]);

    return null;
}

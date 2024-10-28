"use client";

import React, { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { JupiterDialog } from "../dialog/jupiter-dialog";

interface JupiterLinkProps {
    children: React.ReactNode;
    inputMint?: PublicKey | string;
    outputMint?: PublicKey | string;
    onSuccess?: () => void;
    className?: string;
}

export function JupiterLink({
    children,
    inputMint,
    outputMint,
    onSuccess,
    className
}: JupiterLinkProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDialogOpen(true);
    };

    const handleClose = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            <a href="#" onClick={handleClick} className={className}>
                {children}
            </a>
            <JupiterDialog
                open={isDialogOpen}
                close={handleClose}
                inputMint={inputMint}
                outputMint={outputMint}
                onSuccess={onSuccess}
            />
        </>
    );
}

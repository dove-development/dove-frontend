"use client";

import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";

export default function WalletButton({ className }: { className?: string }) {
    return (
        <UnifiedWalletButton
            currentUserClassName={className}
            buttonClassName={className}
        />
    );
}

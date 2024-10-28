"use client";

import React from "react";
import {
    Sheet,
    SheetTitle,
    SheetContent,
    SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VaultAsset } from "@/lib/structs/vault-asset";
import { nf } from "@/lib/utils";
import { ASSET_DECIMALS } from "@/lib/constants";

interface AssetSheetProps {
    open: boolean;
    close: () => void;
    asset: VaultAsset;
    onDepositClick: () => void;
    onWithdrawClick: () => void;
}

export function AssetSheet({
    open,
    close,
    asset,
    onDepositClick,
    onWithdrawClick
}: AssetSheetProps) {
    return (
        <Sheet open={open} onOpenChange={(open) => !open && close()}>
            <SheetContent side="bottom">
                <SheetTitle className="flex items-center justify-center mb-6 text-2xl font-bold">
                    {asset.name}
                </SheetTitle>
                <SheetDescription className="sr-only">
                    {asset.name} details
                </SheetDescription>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <Label>Vault Balance</Label>
                        <div className="text-xl font-semibold">
                            {nf(asset.vaultBalance || 0, ASSET_DECIMALS)}
                        </div>
                    </div>
                    <div>
                        <Label>Wallet Balance</Label>
                        <div className="text-xl font-semibold">
                            {nf(asset.userBalance || 0, ASSET_DECIMALS)}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between gap-4">
                    <Button
                        className="rounded-full flex-1"
                        disabled={!asset.userBalance}
                        onClick={() => {
                            close();
                            document.body.style.pointerEvents = "";
                            onDepositClick();
                        }}
                    >
                        Supply
                    </Button>
                    <Button
                        className="rounded-full flex-1"
                        disabled={!asset.vaultBalance}
                        onClick={() => {
                            close();
                            document.body.style.pointerEvents = "";
                            onWithdrawClick();
                        }}
                    >
                        Withdraw
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

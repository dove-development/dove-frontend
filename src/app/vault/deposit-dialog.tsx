"use client";

import { useState } from "react";
import Position from "@/lib/position";
import { Slider } from "@/components/ui/slider";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { Asset } from "@/lib/structs/asset";
import { ASSET_DECIMALS } from "@/lib/constants";
import { VaultAsset } from "@/lib/structs/vault-asset";
import { nf } from "@/lib/utils";
import { BigSlider } from "@/components/interface/big-slider";

interface DepositDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    position: Position;
    asset: VaultAsset;
    max: number;
}

export default function DepositDialog({
    open,
    close,
    execute,
    position,
    asset,
    max
}: DepositDialogProps) {
    const [amount, setAmount] = useState(0);
    const newPosition = position.withCollateral(
        position.collateral + (asset.price || 0) * amount
    );

    return (
        <TransferDialog
            open={open}
            close={close}
            amount={amount}
            setAmount={setAmount}
            title={`Deposit ${asset.symbol}`}
            max={max}
            decimals={ASSET_DECIMALS}
            stats={[
                {
                    label: "Vault Balance",
                    value: `${nf((asset.vaultBalance || 0) + amount, ASSET_DECIMALS)} ${asset.symbol}`
                },
                {
                    label: "Loan-to-Value Ratio",
                    value: `${nf(newPosition.ltv * 100, 2)}%`
                },
                {
                    label: "Collateral Value",
                    value: `$${nf(newPosition.collateral, 2)}`
                },
                {
                    label: "Liquidation Point",
                    value: `$${nf(newPosition.liquidationPoint, 2)}`
                },
                { label: "Risk Level", value: newPosition.riskLevel }
            ]}
            execute={execute}
        >
            <BigSlider
                value={[amount]}
                onValueChange={(value) => setAmount(value[0] || 0)}
                max={max}
                step={Math.pow(10, -ASSET_DECIMALS)}
            />
        </TransferDialog>
    );
}

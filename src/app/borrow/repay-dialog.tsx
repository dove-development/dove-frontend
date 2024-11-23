"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import Position from "@/lib/position";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { nf } from "@/lib/utils";
import { VaultAsset } from "@/lib/structs/vault-asset";
import { ASSET_DECIMALS } from "@/lib/constants";
import { BigSlider } from "@/components/interface/big-slider";

interface RepayDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    position: Position;
    dvdBalance: number;
}

export default function RepayDialog({
    open,
    close,
    execute,
    position,
    dvdBalance
}: RepayDialogProps) {
    const [amount, setAmount] = useState(0);
    const newPosition = position.withDebt(position.debt - amount);

    return (
        <TransferDialog
            open={open}
            close={close}
            amount={amount}
            setAmount={(amount) => setAmount(amount)}
            title="Repay DVD"
            max={dvdBalance}
            decimals={2}
            stats={[
                {
                    label: "Total Debt",
                    value: `${nf(newPosition.debt, 2)} DVD`
                },
                {
                    label: "Loan-to-Value Ratio",
                    value: `${nf(newPosition.ltv * 100, 2)}%`
                },
                { label: "Collateral Value", value: `$${nf(position.collateral, 2)}` },
                {
                    label: "Liquidation Point",
                    value: `$${nf(newPosition.liquidationPoint, 2)}`
                },
                { label: "Risk Level", value: newPosition.riskLevel }
            ]}
            execute={execute}
        >
            <BigSlider
                min={0}
                max={position.debt}
                value={[amount]}
                onValueChange={(v) => setAmount(Math.min(v[0] ?? 0, dvdBalance))}
                step={0.01}
            />
        </TransferDialog>
    );
}

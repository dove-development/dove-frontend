"use client";

import { useState } from "react";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { ASSET_DECIMALS } from "@/lib/constants";
import { nf } from "@/lib/utils";
import { BigSlider } from "@/components/interface/big-slider";

interface DepositDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    max: number;
    total: number;
}

export default function DepositDialog({
    open,
    close,
    execute,
    max,
    total
}: DepositDialogProps) {
    const [amount, setAmount] = useState(0);

    return (
        <TransferDialog
            open={open}
            close={close}
            amount={amount}
            setAmount={setAmount}
            title="Deposit DVD"
            max={max}
            decimals={2}
            stats={[
                {
                    label: "Savings Balance",
                    value: `${nf(total + amount, 2)} DVD`
                }
            ]}
            execute={execute}
        >
            <BigSlider
                value={[amount]}
                onValueChange={(value) => setAmount(value[0] ?? 0)}
                max={max}
                step={Math.pow(10, -ASSET_DECIMALS)}
            />
        </TransferDialog>
    );
}

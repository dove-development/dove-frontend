"use client";

import { useState } from "react";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { ASSET_DECIMALS } from "@/lib/constants";
import { nf } from "@/lib/utils";
import { BigSlider } from "@/components/interface/big-slider";

interface WithdrawDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    total: number;
}

export default function WithdrawDialog({
    open,
    close,
    execute,
    total
}: WithdrawDialogProps) {
    const [amount, setAmount] = useState(0);

    return (
        <TransferDialog
            open={open}
            close={close}
            amount={amount}
            setAmount={setAmount}
            title="Withdraw DVD"
            max={total}
            decimals={2}
            stats={[
                {
                    label: "Total Savings",
                    value: `${nf(total - amount, 2)} DVD`
                }
            ]}
            execute={execute}
        >
            <BigSlider
                value={[amount]}
                onValueChange={(value) => setAmount(value[0] ?? 0)}
                max={total}
                step={Math.pow(10, -ASSET_DECIMALS)}
            />
        </TransferDialog>
    );
}

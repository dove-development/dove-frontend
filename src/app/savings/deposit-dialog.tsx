"use client";

import { useState } from "react";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { ASSET_DECIMALS } from "@/lib/constants";
import SavingsAccount from "@/lib/structs/savings-account";
import { nf } from "@/lib/utils";
import { BigSlider } from "@/components/interface/big-slider";

interface DepositDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    max: number;
    account: SavingsAccount;
}

export default function DepositDialog({
    open,
    close,
    execute,
    max,
    account
}: DepositDialogProps) {
    const [amount, setAmount] = useState(0);
    const newSavings = account.withBalance(account.balance + amount);

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
                    value: `${nf(newSavings.balance, 2)} DVD`
                },
                {
                    label: "30-day Projection",
                    value: `+${nf(newSavings.projectGrowth(30), 2)} DVD`
                },
                {
                    label: "1-year Projection",
                    value: `+${nf(newSavings.projectGrowth(365), 2)} DVD`
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

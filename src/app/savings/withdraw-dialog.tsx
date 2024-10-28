"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { ASSET_DECIMALS } from "@/lib/constants";
import SavingsAccount from "@/lib/structs/savings-account";
import { nf } from "@/lib/utils";
import { BigSlider } from "@/components/interface/big-slider";

interface WithdrawDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    account: SavingsAccount;
}

export default function WithdrawDialog({
    open,
    close,
    execute,
    account
}: WithdrawDialogProps) {
    const [amount, setAmount] = useState(0);
    const newSavings = account.withBalance(account.balance - amount);

    return (
        <TransferDialog
            open={open}
            close={close}
            amount={amount}
            setAmount={setAmount}
            title="Withdraw DVD"
            max={account.balance}
            decimals={2}
            stats={[
                {
                    label: "Total Savings",
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
                max={account.balance}
                step={Math.pow(10, -ASSET_DECIMALS)}
            />
        </TransferDialog>
    );
}

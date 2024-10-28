"use client";

import { useState } from "react";
import Position from "@/lib/position";
import RiskSlider from "@/app/vault/risk-slider";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { nf } from "@/lib/utils";

interface BorrowDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    position: Position;
}

export default function BorrowDialog({
    open,
    close,
    execute,
    position
}: BorrowDialogProps) {
    const [amount, setAmount] = useState(0);
    const newPosition = position.withDebt(position.debt + amount);
    const loanToValueRatio = newPosition.ltv;

    return (
        <TransferDialog
            open={open}
            close={close}
            amount={amount}
            setAmount={setAmount}
            title="Borrow DVD"
            max={position.availableToBorrow}
            decimals={2}
            stats={[
                { label: "Vault Debt", value: `${nf(newPosition.debt, 2)} DVD` },
                {
                    label: "Loan-to-Value Ratio",
                    value: `${nf(loanToValueRatio * 100, 2)}%`
                },
                { label: "Collateral Value", value: `$${nf(position.collateral, 2)}` },
                {
                    label: "Liquidation Point",
                    value: `$${nf(newPosition.liquidationPoint, 2)}`
                }
            ]}
            execute={execute}
            warning={
                loanToValueRatio >= 0.6 ? (
                    <span>
                        High liquidation risk. Collateral value drop of only{" "}
                        <b>
                            {nf(
                                newPosition.maxCollateralDropPercentageBeforeLiquidation,
                                2
                            )}
                            %
                        </b>{" "}
                        will trigger liquidation.
                    </span>
                ) : undefined
            }
        >
            <RiskSlider
                min={0}
                max={position.borrowCapacity}
                value={[newPosition.debt]}
                onValueChange={([v]) =>
                    setAmount(Math.max(0, (v || 0) - position.debt))
                }
                step={0.01}
            />
        </TransferDialog>
    );
}

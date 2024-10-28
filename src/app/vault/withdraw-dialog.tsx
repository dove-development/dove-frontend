"use client";

import { useState } from "react";
import Position from "@/lib/position";
import { Slider } from "@/components/ui/slider";
import TransferDialog from "@/components/dialog/transfer-dialog";
import { ASSET_DECIMALS } from "@/lib/constants";
import { VaultAsset } from "@/lib/structs/vault-asset";
import { nf } from "@/lib/utils";
import { BigSlider } from "@/components/interface/big-slider";

interface WithdrawDialogProps {
    open: boolean;
    close: () => void;
    execute: (amount: number) => Promise<void>;
    position: Position;
    asset: VaultAsset;
    max: number;
}

export default function WithdrawDialog({
    open,
    close,
    execute,
    position,
    asset,
    max
}: WithdrawDialogProps) {
    const [amount, setAmount] = useState(0);
    const newPosition = position.withCollateral(
        position.collateral - (asset.price || 0) * amount
    );
    const effectiveMax = position.availableToWithdraw / (asset.price || 0);

    return (
        <TransferDialog
            open={open}
            close={close}
            amount={amount}
            setAmount={setAmount}
            title={`Withdraw ${asset.symbol}`}
            max={effectiveMax}
            decimals={ASSET_DECIMALS}
            stats={[
                {
                    label: "Vault Balance",
                    value: `${nf(max - amount, ASSET_DECIMALS)} ${asset.symbol}`
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
            warning={
                newPosition.ltv >= 0.6 ? (
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
            <BigSlider
                value={[amount]}
                onValueChange={(value) =>
                    setAmount(Math.min(value[0] || 0, effectiveMax))
                }
                max={max}
                step={Math.pow(10, -ASSET_DECIMALS)}
            />
        </TransferDialog>
    );
}

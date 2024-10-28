import { Droplets } from "lucide-react";
import AlertBanner from "@/components/interface/alert-banner";
import Ledger from "@/lib/ledger";
import { useState } from "react";

interface LiquidationBannerProps {
    isDebtZero: boolean;
    ledger: Ledger;
}

export default function LiquidationBanner({
    isDebtZero,
    ledger
}: LiquidationBannerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    return (
        <AlertBanner
            message="Vault is liquidated. Repay your debt, then press Unliquidate."
            className="mt-6"
            colorScheme="blue"
            iconComponent={Droplets}
            error={error}
            button={{
                text: "Unliquidate",
                disabled: !isDebtZero || loading,
                loading: loading,
                onClick: () => {
                    setLoading(true);
                    ledger
                        .unliquidate()
                        .catch((e) => {
                            setError(String(e));
                            setLoading(false);
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }
            }}
        />
    );
}

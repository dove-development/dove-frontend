import React from "react";
import AlertBanner from "@/components/interface/alert-banner";
import { OctagonAlert } from "lucide-react";

interface UnhealthyBannerProps {
    ltv: number;
    maxLtv: number;
}

export const UnhealthyBanner: React.FC<UnhealthyBannerProps> = ({ ltv, maxLtv }) => {
    return (
        <AlertBanner
            message={
                <span>
                    Your position is unhealthy. Your LTV is{" "}
                    <strong>{(ltv * 100).toFixed(2)}%</strong> and the maximum is{" "}
                    <strong>{(maxLtv * 100).toFixed(2)}%</strong>. To avoid liquidation,
                    deposit assets or repay debt.
                </span>
            }
            colorScheme="yellow"
            iconComponent={OctagonAlert}
            className="mt-6"
        />
    );
};

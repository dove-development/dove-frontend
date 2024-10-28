import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import ErrorBanner from "@/components/interface/error-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { nf } from "@/lib/utils";
import SvgIcon from "@/components/interface/svg-icon";
import { ASSET_DECIMALS } from "@/lib/constants";

interface RewardsCardProps {
    rewardsLabel: string;
    rewards: number | undefined;
    claimRewards: () => Promise<void>;
    disabled?: boolean;
}

export default function RewardsCard({
    rewardsLabel,
    rewards,
    claimRewards,
    disabled
}: RewardsCardProps) {
    const [claimingRewards, setClaimingRewards] = useState(false);
    const [rewardsError, setRewardsError] = useState<string>("");
    const clearRewardsError = () => setRewardsError("");
    const onClaimClick = () => {
        setClaimingRewards(true);
        claimRewards()
            .catch((error) => setRewardsError(String(error)))
            .finally(() => setClaimingRewards(false));
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-between h-full space-y-2">
                {rewardsError && (
                    <ErrorBanner
                        error={rewardsError}
                        buttonText="Close"
                        onClick={clearRewardsError}
                        className="mb-4"
                    />
                )}
                <h3 className="text-base font-medium">{rewardsLabel}</h3>
                <div className="text-3xl font-bold flex items-center">
                    {rewards !== undefined ? (
                        <>
                            <SvgIcon
                                icon="/icons/dove.svg"
                                className="h-7 w-7 mr-[10px]"
                                alt="Dove Icon"
                            />
                            {nf(rewards, ASSET_DECIMALS)}
                        </>
                    ) : (
                        <Skeleton className="w-24 h-8" />
                    )}
                </div>
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                    disabled={
                        disabled ||
                        claimingRewards ||
                        rewards === undefined ||
                        !parseFloat(nf(rewards, ASSET_DECIMALS))
                    }
                    onClick={onClaimClick}
                >
                    {claimingRewards && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Claim
                </Button>
            </CardContent>
        </Card>
    );
}

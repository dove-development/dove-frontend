"use client";

import React, { useMemo } from "react";
import AreaChart from "@/components/interface/area-chart";
import {
    InterfaceContainer,
    InterfaceHeader,
    NarrowerContent,
    Sidebar,
    UnequalSplit,
    WiderContent
} from "@/components/store/layout";
import { AssetTitle } from "@/components/store/asset";
import { useCache } from "@/components/providers/cache-provider";
import WorldCache from "@/lib/cache/world-cache";
import { RefreshButton } from "@/components/store/button";
import { useLedger } from "@/components/providers/ledger-provider";
import ValueCard from "@/components/card/value-card";
import CollateralCache from "@/lib/cache/collateral-cache";
import { nf } from "@/lib/utils";
import SvgIcon from "@/components/interface/svg-icon";
import ListCard from "@/components/card/list-card";
import DvdSupplyCache from "@/lib/cache/dvd-supply-cache";
import ErrorBanner from "@/components/interface/error-banner";

export default function MetricsDashboard() {
    const [worldCache, worldError] = useCache(WorldCache, []);
    const [collateralCache, collateralError] = useCache(CollateralCache, []);
    const [dvdSupplyCache, dvdSupplyError] = useCache(DvdSupplyCache, []);

    const error = worldError || collateralError || dvdSupplyError;
    const ledger = useLedger();
    const refresh = () => {
        ledger.invalidate([WorldCache, CollateralCache, DvdSupplyCache]);
    };
    const retry = () => {
        const culprits = [];
        worldError && culprits.push(WorldCache);
        collateralError && culprits.push(CollateralCache);
        dvdSupplyError && culprits.push(DvdSupplyCache);
        ledger.invalidate(culprits);
    };

    const [dvdSupply, doveSupply, doveRelease, dovePrice] = useMemo(() => {
        const world = worldCache?.world;
        return [
            world?.dvd.supply,
            world?.dove.supply,
            worldCache?.doveRelease,
            worldCache?.dovePrice
        ];
    }, [worldCache]);
    const tvl = useMemo(() => {
        let result = 0;
        collateralCache?.forEach((c) => {
            result += c.deposited * c.price;
        });
        return result;
    }, [collateralCache]);

    return (
        <InterfaceContainer>
            {error && (
                <ErrorBanner
                    error={error}
                    buttonText="Retry"
                    onClick={retry}
                    className="mt-6"
                />
            )}
            <InterfaceHeader>
                <AssetTitle
                    title="DVD Supply"
                    value={dvdSupply}
                    icon={"/icons/dvd.svg"}
                />
                <RefreshButton loading={dvdSupply === undefined} refresh={refresh} />
            </InterfaceHeader>
            <UnequalSplit>
                <WiderContent>
                    {dvdSupplyCache && (
                        <AreaChart data={dvdSupplyCache} seriesName="DVD Supply" />
                    )}
                    {dvdSupplyCache === undefined && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    )}
                </WiderContent>
                <NarrowerContent>
                    <Sidebar>
                        <ValueCard label="TVL" value={`$${nf(tvl, 2)}`} />
                        <ValueCard
                            label="DOVE Supply"
                            value={
                                doveSupply !== undefined ? (
                                    <>
                                        <SvgIcon
                                            icon="/icons/dove.svg"
                                            className="h-7 w-7 mr-[10px]"
                                            alt="Dove Icon"
                                        />
                                        {nf(doveSupply, 2)}
                                    </>
                                ) : undefined
                            }
                        />
                        <ListCard
                            items={[
                                {
                                    label: "DOVE Released",
                                    value:
                                        doveSupply !== undefined &&
                                        doveRelease !== undefined
                                            ? `${nf((doveSupply / doveRelease) * 100, 2)}%`
                                            : undefined
                                },
                                {
                                    label: "DOVE Price",
                                    value:
                                        dovePrice !== undefined
                                            ? `$${nf(dovePrice, 2)}`
                                            : undefined
                                },
                                {
                                    label: "DOVE Market Cap",
                                    value:
                                        dovePrice !== undefined &&
                                        doveSupply !== undefined
                                            ? `$${nf(dovePrice * doveSupply, 2)}`
                                            : undefined
                                }
                            ]}
                        />
                    </Sidebar>
                </NarrowerContent>
            </UnequalSplit>
        </InterfaceContainer>
    );
}

"use client";

import { useState, useMemo } from "react";
import { useCache } from "@/components/providers/cache-provider";
import WorldCache from "@/lib/cache/world-cache";
import { useLedger } from "@/components/providers/ledger-provider";
import DvdCache from "@/lib/cache/dvd-cache";
import { nf } from "@/lib/utils";
import { SavingsCache } from "@/lib/cache/savings-cache";
import StablecoinCache from "@/lib/cache/stablecoin-cache";
import Stablecoin from "@/lib/structs/stablecoin";
import { JupiterDialog } from "@/components/dialog/jupiter-dialog";
import DepositDialog from "@/app/stake/deposit-dialog";
import WithdrawDialog from "@/app/stake/withdraw-dialog";
import { Button } from "@/components/ui/button";
import DoveCache from "@/lib/cache/dove-cache";

import { AssetDisplay, AssetBalance, AssetTitle } from "@/components/store/asset";
import { RefreshButton, HeaderButton } from "@/components/store/button";
import {
    InterfaceContainer,
    UnequalSplit,
    WiderContent,
    NarrowerContent,
    Sidebar,
    InterfaceHeader,
    ResponsiveList
} from "@/components/store/layout";
import { DesktopSpan, MobileSpan } from "@/components/store/span";
import {
    TableHeadLeft,
    TableHeadRight,
    TableHeadDesktop,
    TableCellLeft,
    TableCellRight,
    TableCellDesktop,
    TableRowMobileClickable
} from "@/components/store/table";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import ErrorBanner from "@/components/interface/error-banner";
import RewardsCard from "@/components/card/rewards-card";
import ValueCard from "@/components/card/value-card";
import { DOVE_TRADE_MINT } from "@/lib/constants";

class SavingsAsset extends Stablecoin {
    balance?: number;
    public constructor({
        stablecoin,
        balance
    }: {
        stablecoin: Stablecoin;
        balance?: number;
    }) {
        super({
            name: stablecoin.name,
            symbol: stablecoin.symbol,
            icon: stablecoin.icon,
            mint: stablecoin.mint,
            hasStability: stablecoin.hasStability,
            is2022: stablecoin.is2022
        });
        this.balance = balance;
    }
}

export default function Page() {
    const ledger = useLedger();

    const [worldCache, worldError] = useCache(WorldCache, []);
    const [stablecoinCache, stablecoinError] = useCache(StablecoinCache, []);
    const [savingsCache, savingsError] = useCache(SavingsCache, [worldCache]);
    const [dvdCache, dvdError] = useCache(DvdCache, [worldCache]);
    const [doveCache, doveError] = useCache(DoveCache, [worldCache]);

    const cacheError =
        worldError || stablecoinError || savingsError || dvdError || doveError;
    const cacheRetry = () => {
        const culprits = [];
        worldError && culprits.push(WorldCache);
        stablecoinError && culprits.push(StablecoinCache);
        savingsError && culprits.push(SavingsCache);
        dvdError && culprits.push(DvdCache);
        doveError && culprits.push(DoveCache);
        ledger.invalidate(culprits);
    };
    const cacheRefresh = () => {
        ledger.invalidate([
            WorldCache,
            StablecoinCache,
            SavingsCache,
            DvdCache,
            DoveCache
        ]);
    };

    const { world } = worldCache || {};
    const { total, rewards } = savingsCache || {};

    const [openDialog, setOpenDialog] = useState<
        "deposit" | "withdraw" | "jupiter" | undefined
    >(undefined);
    const [selectedAsset, setSelectedAsset] = useState<SavingsAsset | undefined>(
        undefined
    );

    const handleDialogOpen = (dialogType: typeof openDialog, asset?: SavingsAsset) => {
        setOpenDialog(dialogType);
        setSelectedAsset(asset);
    };

    const handleDialogClose = () => {
        setOpenDialog(undefined);
        setSelectedAsset(undefined);
    };

    const assets = Stablecoin.LIST.map(
        (stablecoin) =>
            new SavingsAsset({
                stablecoin,
                balance: stablecoinCache?.get(stablecoin)?.balance
            })
    );

    return (
        <>
            <DepositDialog
                open={openDialog === "deposit"}
                close={handleDialogClose}
                execute={(amount) => {
                    if (!world || !savingsCache) {
                        return Promise.reject("World or savings not loaded");
                    }
                    return ledger.depositDvd(amount, world, savingsCache);
                }}
                max={dvdCache?.balance || 0}
                total={total || 0}
            />
            <WithdrawDialog
                open={openDialog === "withdraw"}
                close={handleDialogClose}
                execute={(amount) => {
                    if (!world || !savingsCache) {
                        return Promise.reject("World or savings not loaded");
                    }
                    return ledger.withdrawDvd(amount, world, savingsCache);
                }}
                total={total || 0}
            />
            <JupiterDialog
                open={openDialog === "jupiter"}
                close={handleDialogClose}
                inputMint={selectedAsset?.mint}
                outputMint={DOVE_TRADE_MINT}
                onSuccess={cacheRefresh}
            />
            <InterfaceContainer>
                {cacheError && (
                    <ErrorBanner
                        error={cacheError}
                        buttonText="Retry"
                        onClick={cacheRetry}
                        className="mt-6"
                    />
                )}
                <InterfaceHeader>
                    <AssetTitle
                        title="Staked Balance"
                        value={total}
                        icon={"/icons/dvd.svg"}
                    />

                    <ResponsiveList>
                        <HeaderButton
                            onClick={() => handleDialogOpen("deposit")}
                            disabled={!dvdCache?.balance}
                        >
                            Deposit DVD
                        </HeaderButton>
                        <HeaderButton
                            onClick={() => handleDialogOpen("withdraw")}
                            disabled={!total}
                        >
                            Withdraw DVD
                        </HeaderButton>
                        <RefreshButton
                            loading={
                                !cacheError &&
                                (total === undefined ||
                                    rewards === undefined ||
                                    worldCache?.savingsRewardsApy === undefined)
                            }
                            refresh={cacheRefresh}
                        />
                    </ResponsiveList>
                </InterfaceHeader>
                <UnequalSplit>
                    <WiderContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeadLeft>
                                        <MobileSpan>Asset</MobileSpan>
                                        <DesktopSpan>Stable Asset</DesktopSpan>
                                    </TableHeadLeft>
                                    <TableHeadRight>
                                        <MobileSpan>Balance</MobileSpan>
                                        <DesktopSpan>Wallet Balance</DesktopSpan>
                                    </TableHeadRight>
                                    <TableHeadDesktop />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map((asset) => (
                                    <TableRowMobileClickable
                                        key={asset.symbol}
                                        onClick={() =>
                                            handleDialogOpen("jupiter", asset)
                                        }
                                    >
                                        <TableCellLeft>
                                            <AssetDisplay
                                                icon={asset.icon}
                                                name={asset.name}
                                                symbol={asset.symbol}
                                            />
                                        </TableCellLeft>
                                        <TableCellRight>
                                            <AssetBalance
                                                balance={asset.balance}
                                                decimals={2}
                                            />
                                        </TableCellRight>
                                        <TableCellDesktop>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="rounded-full"
                                                disabled={!asset.balance}
                                                onClick={() =>
                                                    handleDialogOpen("jupiter", asset)
                                                }
                                            >
                                                Convert
                                            </Button>
                                        </TableCellDesktop>
                                    </TableRowMobileClickable>
                                ))}
                            </TableBody>
                        </Table>
                    </WiderContent>
                    <NarrowerContent>
                        <Sidebar>
                            <RewardsCard
                                rewardsLabel="Savings Rewards"
                                rewards={rewards}
                                claimRewards={() => {
                                    if (!world || !doveCache)
                                        return Promise.reject(
                                            "World or DOVE cache not loaded"
                                        );
                                    return ledger.claimRewards(
                                        world,
                                        doveCache,
                                        "savings"
                                    );
                                }}
                            />
                            <ValueCard
                                label="Rewards APY"
                                value={
                                    worldCache?.savingsRewardsApy !== undefined
                                        ? `${nf(
                                              worldCache.savingsRewardsApy.toPercentage(),
                                              2
                                          )}%`
                                        : undefined
                                }
                            />
                        </Sidebar>
                    </NarrowerContent>
                </UnequalSplit>
            </InterfaceContainer>
        </>
    );
}

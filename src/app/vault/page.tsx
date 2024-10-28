"use client";

import { useState, useMemo } from "react";
import BorrowDialog from "@/app/vault/borrow-dialog";
import RepayDialog from "@/app/vault/repay-dialog";
import DepositDialog from "@/app/vault/deposit-dialog";
import WithdrawDialog from "@/app/vault/withdraw-dialog";
import Position, { RiskLevel } from "@/lib/position";
import { useCache } from "@/components/providers/cache-provider";
import { Asset } from "@/lib/structs/asset";
import VaultCache from "@/lib/cache/vault-cache";
import WorldCache from "@/lib/cache/world-cache";
import CollateralCache from "@/lib/cache/collateral-cache";
import AssetCache from "@/lib/cache/asset-cache";
import { useLedger } from "@/components/providers/ledger-provider";
import DvdCache from "@/lib/cache/dvd-cache";
import { AssetSheet } from "./asset-sheet";
import { Button } from "@/components/ui/button";
import { Droplet, Droplets, Minus, OctagonAlert, Plus } from "lucide-react";
import { ASSET_DECIMALS } from "@/lib/constants";
import { nf } from "@/lib/utils";
import { VaultAsset } from "@/lib/structs/vault-asset";
import DoveCache from "@/lib/cache/dove-cache";

import { AssetDisplay, AssetBalance, AssetTitle } from "@/components/store/asset";
import { RefreshButton, HeaderButton } from "@/components/store/button";
import {
    InterfaceContainer,
    UnequalSplit,
    WiderContent,
    NarrowerContent,
    Sidebar,
    TwoColumn,
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
import ListCard from "@/components/card/list-card";
import LiquidationBanner from "./liquidation-banner";
import { UnhealthyBanner } from "./unhealthy-banner";

export default function Page() {
    const ledger = useLedger();

    const [worldCache, worldError] = useCache(WorldCache, []);
    const [collateralCache, collateralError] = useCache(CollateralCache, []);
    const [assetCache, assetError] = useCache(AssetCache, [collateralCache]);
    const [vaultCache, vaultError] = useCache(VaultCache, [
        worldCache,
        collateralCache
    ]);
    const [dvdCache, dvdError] = useCache(DvdCache, [worldCache]);
    const [doveCache, doveError] = useCache(DoveCache, [worldCache]);

    const error =
        worldError ||
        collateralError ||
        assetError ||
        vaultError ||
        dvdError ||
        doveError;

    const retry = () => {
        const culprits = [];
        worldError && culprits.push(WorldCache);
        collateralError && culprits.push(CollateralCache);
        assetError && culprits.push(AssetCache);
        vaultError && culprits.push(VaultCache);
        dvdError && culprits.push(DvdCache);
        doveError && culprits.push(DoveCache);
        ledger.invalidate(culprits);
    };

    const refresh = () => {
        ledger.invalidate([
            WorldCache,
            CollateralCache,
            AssetCache,
            VaultCache,
            DvdCache,
            DoveCache
        ]);
    };

    const { world } = worldCache || {};
    const { vault, debt, rewards } = vaultCache || {};

    const vaultAssets = useMemo(
        () =>
            Asset.LIST.map(
                (asset) =>
                    new VaultAsset({
                        asset,
                        price: collateralCache?.get(asset)?.price,
                        userBalance: assetCache?.get(asset)?.balance,
                        vaultBalance:
                            vaultCache && (vaultCache?.balances.get(asset) || 0)
                    })
            ),
        [collateralCache, assetCache, vaultCache]
    );

    const collateralValue = useMemo(() => {
        let total = 0;
        for (const asset of vaultAssets) {
            if (asset.price === undefined || asset.vaultBalance === undefined) {
                return undefined;
            }
            total += asset.price * asset.vaultBalance;
        }
        return total;
    }, [vaultAssets]);

    const position = useMemo(
        () =>
            debt !== undefined && collateralValue !== undefined
                ? new Position(collateralValue, debt)
                : undefined,
        [debt, collateralValue]
    );

    const [openDialog, setOpenDialog] = useState<
        "borrow" | "repay" | "deposit" | "withdraw" | "asset" | null
    >(null);
    const [selectedAsset, setSelectedAsset] = useState<VaultAsset>(
        () => new VaultAsset({ asset: Asset.NOTHING })
    );

    const handleDialogOpen = (dialogType: typeof openDialog, asset?: VaultAsset) => {
        setOpenDialog(dialogType);
        if (asset) setSelectedAsset(asset);
    };

    const handleDialogClose = () => {
        setOpenDialog(null);
    };

    const liquidated = vault?.isLiquidated || false;

    return (
        <>
            <BorrowDialog
                open={openDialog === "borrow"}
                close={handleDialogClose}
                position={position || Position.ZERO}
                execute={(amount) => {
                    if (!world || !vaultCache || !dvdCache) {
                        return Promise.reject("World, vault, or DVD not loaded");
                    }
                    return ledger.borrowDvd(amount, world, vaultCache, dvdCache);
                }}
            />
            <RepayDialog
                open={openDialog === "repay"}
                close={handleDialogClose}
                position={position || Position.ZERO}
                execute={(amount) => {
                    if (!world || !vault || !dvdCache) {
                        return Promise.reject("World, vault, or DVD not loaded");
                    }
                    return ledger.repayDvd(
                        amount,
                        position?.debt || 0,
                        world,
                        vault,
                        dvdCache
                    );
                }}
                dvdBalance={dvdCache?.balance || 0}
            />
            <DepositDialog
                open={openDialog === "deposit"}
                close={handleDialogClose}
                execute={(amount) => {
                    if (!vaultCache || !assetCache) {
                        return Promise.reject("Vault not loaded");
                    }
                    return ledger.depositAsset(
                        selectedAsset,
                        amount,
                        assetCache,
                        vaultCache
                    );
                }}
                position={position || Position.ZERO}
                asset={selectedAsset}
                max={selectedAsset.userBalance || 0}
            />
            <WithdrawDialog
                open={openDialog === "withdraw"}
                close={handleDialogClose}
                execute={(amount) => {
                    if (!vaultCache || !assetCache) {
                        return Promise.reject("Vault not loaded");
                    }
                    return ledger.withdrawAsset(
                        selectedAsset,
                        amount,
                        assetCache,
                        vaultCache
                    );
                }}
                position={position || Position.ZERO}
                asset={selectedAsset}
                max={selectedAsset.vaultBalance || 0}
            />
            <AssetSheet
                open={openDialog === "asset"}
                close={handleDialogClose}
                asset={selectedAsset}
                onDepositClick={() => handleDialogOpen("deposit", selectedAsset)}
                onWithdrawClick={() => handleDialogOpen("withdraw", selectedAsset)}
            />
            <InterfaceContainer>
                {error && (
                    <ErrorBanner
                        error={error}
                        buttonText="Retry"
                        onClick={retry}
                        className="mt-6"
                    />
                )}
                {vault?.isLiquidated && (
                    <LiquidationBanner isDebtZero={vault.isDebtZero} ledger={ledger} />
                )}
                {position?.isUnhealthy && !liquidated && (
                    <UnhealthyBanner ltv={position.ltv} maxLtv={position.maxLtv} />
                )}
                <InterfaceHeader>
                    <AssetTitle title="Vault Debt" value={debt} icon="/icons/dvd.svg" />
                    <ResponsiveList>
                        <HeaderButton
                            onClick={() => handleDialogOpen("borrow")}
                            disabled={!position || !position.collateral || liquidated}
                        >
                            Borrow DVD
                        </HeaderButton>
                        <HeaderButton
                            onClick={() => handleDialogOpen("repay")}
                            disabled={!position || !position.debt || liquidated}
                        >
                            Repay DVD
                        </HeaderButton>
                        <RefreshButton
                            loading={
                                !error &&
                                (debt === undefined ||
                                    rewards === undefined ||
                                    collateralValue === undefined ||
                                    position === undefined ||
                                    world === undefined ||
                                    worldCache?.vaultRewardsPercentage === undefined)
                            }
                            refresh={refresh}
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
                                        <DesktopSpan>Collateral Asset</DesktopSpan>
                                    </TableHeadLeft>
                                    <TableHeadRight>
                                        <MobileSpan>Balance</MobileSpan>
                                        <DesktopSpan>Vault Balance</DesktopSpan>
                                    </TableHeadRight>
                                    <TableHeadDesktop />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vaultAssets.map((asset) => (
                                    <TableRowMobileClickable
                                        key={asset.symbol}
                                        onClick={() => handleDialogOpen("asset", asset)}
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
                                                balance={asset.vaultBalance}
                                                decimals={ASSET_DECIMALS}
                                            />
                                        </TableCellRight>
                                        <TableCellDesktop>
                                            <div className="flex justify-end">
                                                <Button
                                                    className="p-3 w-[44px] h-[44px] rounded-full mr-3"
                                                    variant="outline"
                                                    disabled={
                                                        asset.isUserBalanceNegligible ||
                                                        liquidated
                                                    }
                                                    onClick={() =>
                                                        handleDialogOpen(
                                                            "deposit",
                                                            asset
                                                        )
                                                    }
                                                >
                                                    <Plus />
                                                </Button>
                                                <Button
                                                    className="p-3 w-[44px] h-[44px] rounded-full"
                                                    variant="outline"
                                                    disabled={
                                                        asset.isVaultBalanceNegligible ||
                                                        liquidated
                                                    }
                                                    onClick={() =>
                                                        handleDialogOpen(
                                                            "withdraw",
                                                            asset
                                                        )
                                                    }
                                                >
                                                    <Minus />
                                                </Button>
                                            </div>
                                        </TableCellDesktop>
                                    </TableRowMobileClickable>
                                ))}
                            </TableBody>
                        </Table>
                    </WiderContent>
                    <NarrowerContent>
                        <Sidebar>
                            <RewardsCard
                                rewardsLabel="Vault Rewards"
                                rewards={rewards}
                                claimRewards={() => {
                                    if (!world || !doveCache)
                                        return Promise.reject(
                                            "World or DOVE cache not loaded"
                                        );
                                    return ledger.claimRewards(
                                        world,
                                        doveCache,
                                        "vault"
                                    );
                                }}
                                disabled={liquidated}
                            />
                            <TwoColumn>
                                <ValueCard
                                    label="Borrow APY"
                                    value={
                                        world
                                            ? `${(world.config.debtConfig.apy * 100).toFixed(2)}%`
                                            : undefined
                                    }
                                />
                                <ValueCard
                                    label="Rewards APY"
                                    value={
                                        worldCache
                                            ? `${(worldCache.vaultRewardsPercentage * 100).toFixed(2)}%`
                                            : undefined
                                    }
                                />
                            </TwoColumn>
                            <ListCard
                                items={[
                                    {
                                        label: "Collateral Value",
                                        value:
                                            collateralValue !== undefined
                                                ? `$${nf(collateralValue, 2)}`
                                                : undefined
                                    },
                                    {
                                        label: "Liquidation Point",
                                        value: position
                                            ? `$${nf(position.liquidationPoint, 2)}`
                                            : undefined
                                    },
                                    {
                                        label: "Loan-to-Value Ratio",
                                        value: position
                                            ? `${nf(position.ltv * 100, 2)}%`
                                            : undefined
                                    },
                                    {
                                        label: "Max Loan-to-Value Ratio",
                                        value: position
                                            ? `${nf(position.maxLtv * 100, 2)}%`
                                            : undefined
                                    }
                                ]}
                            />
                        </Sidebar>
                    </NarrowerContent>
                </UnequalSplit>
            </InterfaceContainer>
        </>
    );
}

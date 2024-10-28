import { ASSET_DECIMALS } from "../constants";
import { Asset } from "./asset";

export class VaultAsset extends Asset {
    price?: number;
    userBalance?: number;
    vaultBalance?: number;
    public constructor({
        asset,
        price,
        userBalance,
        vaultBalance
    }: {
        asset: Asset;
        price?: number;
        userBalance?: number;
        vaultBalance?: number;
    }) {
        super({
            name: asset.name,
            symbol: asset.symbol,
            icon: asset.icon,
            mint: asset.mint,
            debugPrice: asset.debugPrice,
            isNative: asset.isNative
        });
        this.price = price;
        this.userBalance = userBalance;
        this.vaultBalance = vaultBalance;
    }

    public get isUserBalanceNegligible(): boolean {
        const min = 10 ** -ASSET_DECIMALS;
        return !this.userBalance || this.userBalance < min;
    }

    public get isVaultBalanceNegligible(): boolean {
        const min = 10 ** -ASSET_DECIMALS;
        return !this.vaultBalance || this.vaultBalance < min;
    }
}

import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../wallet";
import { Vault } from "@/../pkg/dove";
import { DOVE_PROGRAM_ID } from "../constants";
import CollateralCache from "./collateral-cache";
import { unwrap, zip } from "../utils";
import { Asset } from "../structs/asset";
import WorldCache from "./world-cache";
import { HashMap } from "../structs/hash-map";

export default class VaultCache {
    public readonly vault: Vault | undefined;
    public readonly debt: number;
    public readonly rewards: number;
    public readonly reserveMints: PublicKey[];
    public readonly reserveOracles: PublicKey[];
    public readonly reserveIndices: HashMap<Asset, number>;
    public readonly balances: HashMap<Asset, number>;

    public static readonly userDependent: boolean = true;
    public static getHashCode(): string {
        return "vault-cache";
    }
    constructor(
        vault: Vault | undefined,
        debt: number,
        rewards: number,
        reserveMints: PublicKey[],
        reserveOracles: PublicKey[],
        reserveIndices: HashMap<Asset, number>,
        balances: HashMap<Asset, number>
    ) {
        this.vault = vault;
        this.debt = debt;
        this.rewards = rewards;
        this.reserveMints = reserveMints;
        this.reserveOracles = reserveOracles;
        this.reserveIndices = reserveIndices;
        this.balances = balances;
    }

    private static readonly EMPTY = new VaultCache(
        undefined,
        0,
        0,
        [],
        [],
        new HashMap(),
        new HashMap()
    );

    static mock(): VaultCache {
        return VaultCache.EMPTY;
    }

    static async fetch(
        wallet: Wallet,
        [{ world }, assetInfoCache]: [WorldCache, CollateralCache]
    ): Promise<VaultCache> {
        if (!wallet.pubkey) {
            return VaultCache.EMPTY;
        }
        const vaultData = await wallet.getAccountData(
            new PublicKey(
                Vault.deriveKey(DOVE_PROGRAM_ID.toBuffer(), wallet.pubkey.toBuffer())
            )
        );
        if (!vaultData) {
            return VaultCache.EMPTY;
        }
        const vault = Vault.fromBytes(vaultData);
        const reserves = vault.reserves;
        const reserveMints = reserves.map((r) => new PublicKey(r.mintKey));
        const reserveAssets = reserveMints.map((m) =>
            unwrap(
                Asset.byMint(m),
                `Can't find symbol for reserve mint ${m.toBase58()}`
            )
        );
        const reserveOracles = reserveAssets.map((a) =>
            unwrap(assetInfoCache.get(a)?.oracleKey, `Can't find oracle for ${a}`)
        );
        const reserveIndices = new HashMap<Asset, number>();
        reserveAssets.forEach((a, index) => {
            reserveIndices.insert(a, index);
        });
        const balances = new HashMap<Asset, number>();
        for (const [reserve, reserveAsset] of zip(reserves, reserveAssets)) {
            balances.insert(reserveAsset, reserve.balance);
        }
        const unixTimestamp = Math.floor(new Date().getTime() / 1000);
        const debt = vault.debt.projectTotal(
            world.debt,
            world.config.debtConfig,
            unixTimestamp
        );
        const rewards = vault.debt.projectRewards(world.debt, unixTimestamp);
        return new VaultCache(
            vault,
            debt,
            rewards,
            reserveMints,
            reserveOracles,
            reserveIndices,
            balances
        );
    }
}

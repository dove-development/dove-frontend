import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../wallet";
import { DOVE_PROGRAM_ID } from "../constants";
import { unwrap } from "../utils";
import { World } from "../../../pkg/dove";

export default class WorldCache {
    public readonly world: World;
    public readonly vaultRewardsPercentage: number;
    public readonly savingsRewardsPercentage: number;
    public readonly dovePrice: number;
    public readonly doveRelease: number = 1_000_000; // hardcoded
    public readonly systemBalance: number;
    public static readonly userDependent: boolean = false;
    private constructor({
        world,
        vaultRewardsPercentage,
        savingsRewardsPercentage,
        dovePrice,
        systemBalance
    }: {
        world: World;
        vaultRewardsPercentage: number;
        savingsRewardsPercentage: number;
        dovePrice: number;
        systemBalance: number;
    }) {
        this.world = world;
        this.vaultRewardsPercentage = vaultRewardsPercentage;
        this.savingsRewardsPercentage = savingsRewardsPercentage;
        this.dovePrice = dovePrice;
        this.systemBalance = systemBalance;
    }
    public static getHashCode(): string {
        return "world-cache";
    }
    public static mock(): WorldCache {
        return new WorldCache({
            world: World.zero(),
            vaultRewardsPercentage: 0,
            savingsRewardsPercentage: 0,
            dovePrice: 0,
            systemBalance: 0
        });
    }
    public static async fetch(wallet: Wallet): Promise<WorldCache> {
        const worldKey = new PublicKey(World.deriveKey(DOVE_PROGRAM_ID.toBuffer()));
        const worldData = await wallet.getAccountData(worldKey);
        const worldBytes = unwrap(worldData, "Can't find world");
        const world = World.fromBytes(worldBytes);

        const oracle = world.config.doveOracle;
        const oracleKey = new PublicKey(oracle.key);
        const oracleInfo = await wallet.getAccountInfo(oracleKey);
        const oracleData = oracleInfo?.data;
        const oracleOwner = oracleInfo?.owner;
        if (!oracleData || !oracleOwner) {
            throw new Error(`Can't find DOVE oracle: ${oracleKey.toBase58()}`);
        }
        const unixTimestamp = Math.floor(new Date().getTime() / 1000);
        const dovePrice = oracle.getPriceNegativeIfStale(
            oracleKey.toBuffer(),
            oracleData || new Uint8Array(),
            oracleOwner?.toBuffer() || new Uint8Array(),
            unixTimestamp
        );
        const worldDebt = world.debt.projectTotal(
            world.config.debtConfig,
            unixTimestamp
        );
        const worldSavings = world.savings.projectTotal(
            world.config.savingsConfig,
            unixTimestamp
        );
        // Calculate the rewards APY %:
        //
        //  rewardPerDay DOVE   365 days   dovePrice USD   100%
        //  ----------------- * -------- * ------------- * ----
        //         1 day         1 year       1 DOVE        1
        //  ---------------------------------------------------
        //                    worldDebt DVD
        const debt = world.debt;
        const savings = world.savings;
        const daysSinceDebtCreation = (unixTimestamp - debt.creationTime) / 86400;
        const vaultRewardsPercentage =
            worldDebt > 1
                ? (debt.rewardSchedule.at(daysSinceDebtCreation) *
                      365 *
                      dovePrice *
                      100) /
                  worldDebt
                : 0;
        const daysSinceSavingsCreation = (unixTimestamp - savings.creationTime) / 86400;
        const savingsRewardsPercentage =
            worldSavings > 1
                ? (savings.rewardSchedule.at(daysSinceSavingsCreation) *
                      365 *
                      dovePrice *
                      100) /
                  worldSavings
                : 0;
        const systemAssets = worldDebt + world.stableDvd.circulating;
        const systemLiabilities = worldSavings + world.dvd.supply;
        const systemBalance = systemAssets - systemLiabilities;
        return new WorldCache({
            world,
            vaultRewardsPercentage,
            savingsRewardsPercentage,
            dovePrice,
            systemBalance
        });
    }
}

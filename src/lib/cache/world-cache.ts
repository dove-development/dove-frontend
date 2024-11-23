import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../wallet";
import { DOVE_PROGRAM_ID } from "../constants";
import { unwrap } from "../utils";
import { World } from "../../../pkg/dove";
import Percentage from "../structs/percentage";

export default class WorldCache {
    public readonly world: World;
    public readonly vaultRewardsApy: Percentage;
    public readonly savingsRewardsApy: Percentage;
    public readonly dovePrice: number;
    public readonly doveRelease: number = 1_000_000; // hardcoded
    public readonly systemBalance: number;
    public readonly totalBorrowApy: Percentage;
    public readonly doveEmittedPerDay: number;
    public readonly dvdSupply: number;
    public static readonly userDependent: boolean = false;
    private constructor({
        world,
        totalBorrowApy,
        vaultRewardsApy,
        savingsRewardsApy,
        dovePrice,
        systemBalance,
        doveEmittedPerDay,
        dvdSupply
    }: {
        world: World;
        totalBorrowApy: Percentage;
        vaultRewardsApy: Percentage;
        savingsRewardsApy: Percentage;
        dovePrice: number;
        systemBalance: number;
        doveEmittedPerDay: number;
        dvdSupply: number;
    }) {
        this.world = world;
        this.totalBorrowApy = totalBorrowApy;
        this.vaultRewardsApy = vaultRewardsApy;
        this.savingsRewardsApy = savingsRewardsApy;
        this.dovePrice = dovePrice;
        this.systemBalance = systemBalance;
        this.doveEmittedPerDay = doveEmittedPerDay;
        this.dvdSupply = dvdSupply;
    }
    public static getHashCode(): string {
        return "world-cache";
    }
    public static mock(): WorldCache {
        return new WorldCache({
            world: World.zero(),
            totalBorrowApy: Percentage.zero(),
            vaultRewardsApy: Percentage.zero(),
            savingsRewardsApy: Percentage.zero(),
            dovePrice: 0,
            systemBalance: 0,
            doveEmittedPerDay: 0,
            dvdSupply: 0
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
        const dovePrice = Math.abs(oracle.getPriceNegativeIfStale(
            oracleKey.toBuffer(),
            oracleData || new Uint8Array(),
            oracleOwner?.toBuffer() || new Uint8Array(),
            unixTimestamp
        ));
        const worldDebt = world.debt.projectTotal(
            world.config.debtConfig,
            unixTimestamp
        );
        const worldSavings = world.savings.projectTotal(
            world.config.savingsConfig,
            unixTimestamp
        );
        
        // Extract world state
        const debt = world.debt;
        const savings = world.savings;
        const config = world.config;
        const { debtConfig, savingsConfig } = config;

        // Calculate days since creation for debt and savings
        const daysSinceDebtCreation = (unixTimestamp - debt.creationTime) / 86400;
        const daysSinceSavingsCreation = (unixTimestamp - savings.creationTime) / 86400;

        // Get reward schedules and daily rewards
        const debtSchedule = debtConfig.rewardSchedule;
        const savingsSchedule = savingsConfig.rewardSchedule;
        const vaultDovePerDay = debtSchedule.at(daysSinceDebtCreation);
        const savingsDovePerDay = savingsSchedule.at(daysSinceSavingsCreation);

        // Calculate the rewards APY (in USD per DVD per year):
        //
        //  rewardPerDay DOVE   365 days   dovePrice USD         1      
        //  ----------------- * -------- * ------------- * -------------
        //         1 day         1 year       1 DOVE       worldDebt DVD  
        const vaultRewardsApy =
            worldDebt > 1
                ? (vaultDovePerDay * 365 * dovePrice) / worldDebt
                : 0;
        const savingsRewardsApy =
            worldSavings > 1
                ? (savingsDovePerDay * 365 * dovePrice) / worldSavings
                : 0;

        // Calculate system balance
        const systemAssets = worldDebt + world.stableDvd.circulating;
        const systemLiabilities = worldSavings + world.dvd.supply;
        const systemBalance = systemAssets - systemLiabilities;

        // Borrow APY (relative to USD) is:
        // - The additional APY levied on DVD borrows (this is protocol surplus)
        // - plus the innate interest accrual of DVD (this all goes to holders)
        const totalBorrowApy =
            debtConfig.interestRate.apy + config.dvdInterestRate.apy;
        const vesting = world.vesting;
        const daysSinceVestingCreation = (unixTimestamp - vesting.creationTime) / 86400;
        const vestingDovePerDay = vesting.schedule.at(daysSinceVestingCreation);
        const doveEmittedPerDay =
            vaultDovePerDay + savingsDovePerDay + vestingDovePerDay;
        // total supply = total token supply + total savings supply
        const dvdSupply = world.dvd.supply + worldSavings;
        return new WorldCache({
            world,
            totalBorrowApy: Percentage.fromDecimal(totalBorrowApy),
            vaultRewardsApy: Percentage.fromDecimal(vaultRewardsApy),
            savingsRewardsApy: Percentage.fromDecimal(savingsRewardsApy),
            dovePrice,
            systemBalance,
            doveEmittedPerDay,
            dvdSupply
        });
    }
}

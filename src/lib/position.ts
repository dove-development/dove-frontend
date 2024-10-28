const NONE_LTV = 0.001;
const CONSERVATIVE_LTV = 0.26;
const MODERATE_LTV = 0.4;
const AGGRESSIVE_LTV = 0.7;
const MAX_LTV = 0.8;

export type RiskLevel =
    | "None"
    | "Conservative"
    | "Moderate"
    | "Aggressive"
    | "Liquidation";

export default class Position {
    public readonly maxLtv: number = MAX_LTV;

    constructor(
        public readonly collateral: number,
        public readonly debt: number
    ) {
        if (debt < 0.01) {
            debt = 0;
        }
        if (collateral < 0.01) {
            collateral = 0;
        }
        this.collateral = Math.max(0, collateral);
        this.debt = Math.max(0, debt);
    }

    public static readonly ZERO = new Position(0, 0);

    public withCollateral(collateral: number): Position {
        return new Position(collateral, this.debt);
    }

    public withDebt(debt: number): Position {
        return new Position(this.collateral, debt);
    }

    get ltv(): number {
        if (this.collateral && this.debt) {
            return this.debt / this.collateral;
        }
        return 0;
    }

    get riskLevel(): RiskLevel {
        const ltv = this.ltv;
        if (ltv < NONE_LTV) return "None";
        if (ltv < CONSERVATIVE_LTV) return "Conservative";
        if (ltv < MODERATE_LTV) return "Moderate";
        if (ltv < AGGRESSIVE_LTV) return "Aggressive";
        return "Liquidation";
    }

    get isUnhealthy(): boolean {
        const riskLevel = this.riskLevel;
        return riskLevel === "Liquidation";
    }

    get borrowCapacity(): number {
        return this.collateral * this.maxLtv;
    }

    get availableToBorrow(): number {
        return Math.max(0, this.borrowCapacity - this.debt);
    }

    get availableToWithdraw(): number {
        return Math.max(0, this.collateral - this.debt / this.maxLtv);
    }

    get liquidationPoint(): number {
        return this.debt / this.maxLtv;
    }

    get maxCollateralDropPercentageBeforeLiquidation(): number {
        if (this.collateral === 0) return 0;
        const dropPercentage = (1 - this.liquidationPoint / this.collateral) * 100;
        return Math.max(0, dropPercentage);
    }
}

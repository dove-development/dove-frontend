export default class SavingsAccount {
    public readonly balance: number;
    public readonly apyPercentage: number;

    public static readonly ZERO = new SavingsAccount(0, 0);

    constructor(balance: number, annualInterestRate: number) {
        this.balance = balance;
        this.apyPercentage = annualInterestRate;
    }

    public projectGrowth(days: number): number {
        return (
            this.balance * Math.pow(1 + this.apyPercentage / 100, days / 365) -
            this.balance
        );
    }

    public withBalance(balance: number): SavingsAccount {
        return new SavingsAccount(balance, this.apyPercentage);
    }
}

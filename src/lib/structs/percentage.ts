import { nf } from "../utils";

export default class Percentage {
    private value: number;

    private constructor(value: number) {
        this.value = value;
    }

    public static fromPercentage(percentage: number): Percentage {
        return new Percentage(percentage / 100);
    }

    public static fromDecimal(decimal: number): Percentage {
        return new Percentage(decimal);
    }

    public static zero(): Percentage {
        return new Percentage(0);
    }

    public toDecimal(): number {
        return this.value;
    }

    public toPercentage(): number {
        return this.value * 100;
    }
}
import { nf } from "../utils";

export default class DialogAmount {
    private s: string;
    private v: number;
    private d: number;
    private constructor(s: string, v: number, d: number) {
        this.s = s;
        this.v = v;
        this.d = d;
    }

    static zero(d: number) {
        return DialogAmount.fromNumber(0, d);
    }

    static fromString(s: string, d: number) {
        const parts = s.split(".");
        let whole = parts[0] || "";
        let decimal = parts[1] !== undefined ? "." : "";
        let fractional = parts[1] || "";

        let wholeNumber = parseInt(whole.replace(/,/g, ""), 10);
        if (isNaN(wholeNumber)) {
            wholeNumber = 0;
            whole = "";
        } else {
            whole = Intl.NumberFormat("en-US").format(wholeNumber);
        }

        if (fractional.length > d) {
            fractional = fractional.slice(0, d);
        }
        while (fractional.length > 0 && isNaN(parseInt(fractional))) {
            fractional = fractional.slice(0, fractional.length - 1);
        }

        s = whole + decimal + fractional;

        const v = wholeNumber + parseFloat(`0.${fractional}`);
        return new DialogAmount(s, v, d);
    }

    static fromNumber(n: number, d: number) {
        n = Math.max(n, 0);
        if (Math.floor(n) === n) {
            return new DialogAmount(Intl.NumberFormat("en-US").format(n), n, d);
        }
        return DialogAmount.fromString(nf(n, d), d);
    }

    lt(n: number) {
        return this.v < n;
    }
    eq(n: number) {
        return this.v === n;
    }
    gt(n: number) {
        return this.v > n;
    }
    min(n: number) {
        if (this.v > n) {
            return DialogAmount.fromNumber(n, this.d);
        }
        return this;
    }
    max(n: number) {
        if (this.v < n) {
            return DialogAmount.fromNumber(n, this.d);
        }
        return this;
    }
    toString() {
        return this.s;
    }
    toNumber() {
        return this.v;
    }
}

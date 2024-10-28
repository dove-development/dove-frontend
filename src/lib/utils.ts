import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function unwrap<T>(v: T | null | undefined, msg: string): T {
    if (v === null || v === undefined) {
        throw new Error(msg);
    }
    return v;
}

export function nf(value: number, decimals: number) {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

const LAMPORTS_PER_SOL = 1_000_000_000;

export function lamportsToSol(amount: number) {
    return amount / LAMPORTS_PER_SOL;
}

export function solToLamports(amount: number) {
    return Math.round(amount * LAMPORTS_PER_SOL);
}

export function zip<T, U>(a: T[], b: U[]): [T, U][] {
    if (a.length < b.length) {
        return a.map((av, i) => [av, b[i]!]);
    }
    return b.map((bv, i) => [a[i]!, bv]);
}

export function tee<T>(name: string, v: T) {
    console.log(name, "=", v);
    return v;
}

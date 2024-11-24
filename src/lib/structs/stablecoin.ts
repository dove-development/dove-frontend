import { Keypair, PublicKey } from "@solana/web3.js";
import { Hashable } from "./hash-map";
import { DEBUG } from "../constants";

export default class Stablecoin implements Hashable {
    public readonly name: string;
    public readonly symbol: string;
    public readonly mint: PublicKey;
    public readonly debugKeypair: Keypair | undefined;
    public readonly icon: string;
    public readonly hasStability: boolean;
    public readonly is2022: boolean;
    constructor({
        name,
        symbol,
        mint,
        icon,
        hasStability,
        is2022
    }: {
        name: string;
        symbol: string;
        mint: PublicKey;
        icon: string;
        hasStability: boolean;
        is2022: boolean;
    }) {
        this.name = name;
        this.symbol = symbol;
        const keypair = DEBUG ? Keypair.fromSeed(Buffer.alloc(32, symbol)) : undefined;
        this.mint = keypair?.publicKey || mint;
        this.debugKeypair = keypair;
        this.icon = icon;
        this.hasStability = hasStability;
        this.is2022 = is2022;
    }

    public getHashCode() {
        return this.symbol;
    }

    public static readonly LIST: Stablecoin[] = [
        new Stablecoin({
            name: "USD Coin",
            symbol: "USDC",
            mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
            icon: "/icons/usdc.svg",
            hasStability: true,
            is2022: false
        }),
        new Stablecoin({
            name: "Tether",
            symbol: "USDT",
            mint: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
            icon: "/icons/usdt.svg",
            hasStability: true,
            is2022: false
        }),
        new Stablecoin({
            name: "PayPal USD",
            symbol: "PYUSD",
            mint: new PublicKey("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"),
            icon: "/icons/pyusd.svg",
            hasStability: false,
            is2022: DEBUG ? false : true
        })
    ];
}

/* tslint:disable */
/* eslint-disable */
/**
 * Initialize Javascript logging and panic handler
 */
export function solana_program_init(): void;
export enum OracleKind {
  ZeroFeed = 0,
  Pyth = 1,
  Switchboard = 2,
  UserFeed = 3,
}
export enum Validity {
  Fresh = 0,
  Stale = 1,
}
export class AccountWasm {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  get_key(): Uint8Array;
  /**
   * @returns {boolean}
   */
  is_signer(): boolean;
  /**
   * @returns {boolean}
   */
  is_writable(): boolean;
}
/**
 * Configuration for a Dutch auction.
 *
 * Example config: `begin_scale = 1.5`, `decay_rate = 0.9995`, `end_scale = 0.15`.
 *
 * The auction is started `50%` above market price and decays by `0.05%` per second.
 *
 * Market price is hit at `t = 810 seconds` or `13.5 minutes`.
 *
 * The auction fails at `15%` of market price at `t = 4050 seconds` or `67.5 minutes`.
 */
export class AuctionConfig {
  free(): void;
  /**
   * @param {number} beginScale
   * @param {number} decayRate
   * @param {number} endScale
   */
  constructor(beginScale: number, decayRate: number, endScale: number);
  /**
   * @returns {AuctionConfig}
   */
  static zero(): AuctionConfig;
  readonly beginScale: number;
  readonly decayRate: number;
  readonly endScale: number;
}
export class Authority {
  free(): void;
  /**
   * @param {Uint8Array} program_key
   * @returns {Uint8Array}
   */
  static deriveKey(program_key: Uint8Array): Uint8Array;
}
/**
 * Creates a new authority account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (paying for account creation)
 * 1. `[writable]` Authority account (PDA, will be created)
 * 2. `[]` System program
 */
export class AuthorityCreate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array): (AccountWasm)[];
}
export class Book {
  free(): void;
  /**
   * @param {BookConfig} config
   * @param {number} unixTimestamp
   * @returns {number}
   */
  projectTotal(config: BookConfig, unixTimestamp: number): number;
  /**
   * @param {number} unixTimestamp
   * @returns {number}
   */
  projectRewards(unixTimestamp: number): number;
  readonly creationTime: number;
  readonly rewardSchedule: Schedule;
}
/**
 * Configuration for a Book
 */
export class BookConfig {
  free(): void;
  /**
   * @param {number} apy
   */
  constructor(apy: number);
  readonly apy: number;
}
export class Collateral {
  free(): void;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} collateralMintKey
   * @returns {Uint8Array}
   */
  static deriveKey(programKey: Uint8Array, collateralMintKey: Uint8Array): Uint8Array;
  /**
   * @param {Uint8Array} bytes
   * @returns {Collateral}
   */
  static fromBytes(bytes: Uint8Array): Collateral;
  readonly decimals: number;
  readonly deposited: number;
  readonly maxDeposit: number;
  readonly oracle: Oracle;
}
/**
 * Creates a new collateral type in the system
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account (paying for account creation)
 * 1. `[writable]` Collateral account (PDA, will be created)
 * 2. `[writable]` Safe account (PDA, will be created)
 * 3. `[]` Authority account (PDA)
 * 4. `[]` World account (PDA)
 * 5. `[]` Mint account (for the collateral token)
 * 6. `[]` System program
 * 7. `[]` SPL Token program
 */
export class CollateralCreate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} sovereignKey
   * @param {Uint8Array} collateralMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, sovereignKey: Uint8Array, collateralMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Sets the oracle for a collateral account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` Collateral account (PDA)
 * 2. `[]` World account (PDA)
 */
export class CollateralSetOracle {
  free(): void;
  /**
   * @param {OracleKind} oracleKind
   * @param {Uint8Array} oracleKey
   * @returns {Uint8Array}
   */
  static getData(oracleKind: OracleKind, oracleKey: Uint8Array): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} sovereignKey
   * @param {Uint8Array} collateralMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, sovereignKey: Uint8Array, collateralMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Updates the maximum deposit limit for a collateral account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` Collateral account (PDA)
 * 2. `[]` World account (PDA)
 */
export class CollateralUpdateMaxDeposit {
  free(): void;
  /**
   * @param {number} newMaxDeposit
   * @returns {Uint8Array}
   */
  static getData(newMaxDeposit: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} sovereignKey
   * @param {Uint8Array} collateralMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, sovereignKey: Uint8Array, collateralMintKey: Uint8Array): (AccountWasm)[];
}
export class Config {
  free(): void;
  /**
   * @param {number} maxLtv
   * @param {Oracle} doveOracle
   * @param {AuctionConfig} auctionConfig
   * @param {BookConfig} debtConfig
   * @param {FlashMintConfig} flashMintConfig
   * @param {OfferingConfig} offeringConfig
   * @param {BookConfig} savingsConfig
   * @param {VaultConfig} vaultConfig
   */
  constructor(maxLtv: number, doveOracle: Oracle, auctionConfig: AuctionConfig, debtConfig: BookConfig, flashMintConfig: FlashMintConfig, offeringConfig: OfferingConfig, savingsConfig: BookConfig, vaultConfig: VaultConfig);
  readonly auctionConfig: AuctionConfig;
  readonly debtConfig: BookConfig;
  readonly doveOracle: Oracle;
  readonly flashMintConfig: FlashMintConfig;
  readonly maxLtv: number;
  readonly offeringConfig: OfferingConfig;
  readonly savingsConfig: BookConfig;
  readonly vaultConfig: VaultConfig;
}
/**
 * Sets a new config for the world
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` World account (PDA)
 */
export class ConfigUpdate {
  free(): void;
  /**
   * @param {Config} new_config
   * @returns {Uint8Array}
   */
  static getData(new_config: Config): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} sovereignKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, sovereignKey: Uint8Array): (AccountWasm)[];
}
/**
 * Positive decimal values, precise to 18 digits, with 68 bits of integer precision
 * Maximum value is (2^128 - 1) / 10^18 = 3.4028 * 10^20
 */
export class Decimal {
  free(): void;
  /**
   * @param {bigint} amount
   * @param {number} decimals
   * @returns {number}
   */
  static tokenAmountToNumber(amount: bigint, decimals: number): number;
  /**
   * @param {number} amount
   * @param {number} decimals
   * @returns {bigint}
   */
  static numberToTokenAmount(amount: number, decimals: number): bigint;
}
export class FlashMint {
  free(): void;
}
/**
 * Executes a flash mint operation
 *
 * Accounts expected:
 *
 * 0. `[writable]` World account (PDA)
 * 1. `[writable]` Debt token mint account
 * 2. `[writable]` User's DVD account
 * 3. `[]` Authority account (PDA)
 * 4. `[]` SPL Token program
 * 5. `[]` Instruction sysvar account
 */
export class FlashMintBegin {
  free(): void;
  /**
   * @param {number} borrowAmount
   * @returns {Uint8Array}
   */
  static getData(borrowAmount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} dvdMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, dvdMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Configuration for the flash mint system.
 */
export class FlashMintConfig {
  free(): void;
  /**
   * @param {number} fee
   * @param {number} limit
   */
  constructor(fee: number, limit: number);
  readonly fee: number;
  readonly limit: number;
}
/**
 * Executes the end of a flash mint operation
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` Debt token mint account
 * 3. `[writable]` User's DVD account
 * 4. `[]` SPL Token program
 */
export class FlashMintEnd {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} dvdMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, dvdMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * A hash; the 32-byte output of a hashing algorithm.
 *
 * This struct is used most often in `solana-sdk` and related crates to contain
 * a [SHA-256] hash, but may instead contain a [blake3] hash, as created by the
 * [`blake3`] module (and used in [`Message::hash`]).
 *
 * [SHA-256]: https://en.wikipedia.org/wiki/SHA-2
 * [blake3]: https://github.com/BLAKE3-team/BLAKE3
 * [`blake3`]: crate::blake3
 * [`Message::hash`]: crate::message::Message::hash
 */
export class Hash {
  free(): void;
  /**
   * Create a new Hash object
   *
   * * `value` - optional hash as a base58 encoded string, `Uint8Array`, `[number]`
   * @param {any} value
   */
  constructor(value: any);
  /**
   * Return the base58 string representation of the hash
   * @returns {string}
   */
  toString(): string;
  /**
   * Checks if two `Hash`s are equal
   * @param {Hash} other
   * @returns {boolean}
   */
  equals(other: Hash): boolean;
  /**
   * Return the `Uint8Array` representation of the hash
   * @returns {Uint8Array}
   */
  toBytes(): Uint8Array;
}
/**
 * wasm-bindgen version of the Instruction struct.
 * This duplication is required until https://github.com/rustwasm/wasm-bindgen/issues/3671
 * is fixed. This must not diverge from the regular non-wasm Instruction struct.
 */
export class Instruction {
  free(): void;
}
export class Instructions {
  free(): void;
  constructor();
  /**
   * @param {Instruction} instruction
   */
  push(instruction: Instruction): void;
}
/**
 * A vanilla Ed25519 key pair
 */
export class Keypair {
  free(): void;
  /**
   * Create a new `Keypair `
   */
  constructor();
  /**
   * Convert a `Keypair` to a `Uint8Array`
   * @returns {Uint8Array}
   */
  toBytes(): Uint8Array;
  /**
   * Recover a `Keypair` from a `Uint8Array`
   * @param {Uint8Array} bytes
   * @returns {Keypair}
   */
  static fromBytes(bytes: Uint8Array): Keypair;
  /**
   * Return the `Pubkey` for this `Keypair`
   * @returns {Pubkey}
   */
  pubkey(): Pubkey;
}
/**
 * wasm-bindgen version of the Message struct.
 * This duplication is required until https://github.com/rustwasm/wasm-bindgen/issues/3671
 * is fixed. This must not diverge from the regular non-wasm Message struct.
 */
export class Message {
  free(): void;
/**
 * The id of a recent ledger entry.
 */
  recent_blockhash: Hash;
}
export class Offering {
  free(): void;
  /**
   * @param {AuctionConfig} config
   * @param {number} unixTimestamp
   * @returns {number}
   */
  getPrice(config: AuctionConfig, unixTimestamp: number): number;
  /**
   * @param {number} unixTimestamp
   * @returns {bigint}
   */
  getSecsElapsed(unixTimestamp: number): bigint;
  /**
   * @param {AuctionConfig} config
   * @returns {number}
   */
  getFailPrice(config: AuctionConfig): number;
  readonly amount: number;
  readonly isActive: boolean;
  readonly isDvd: boolean;
}
/**
 * Buys from the current world offering
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (buyer)
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` Debt token mint account
 * 3. `[writable]` User's DVD account
 * 4. `[writable]` Equity token mint account
 * 5. `[writable]` User's DOVE account
 * 6. `[]` Authority account (PDA)
 * 7. `[]` SPL Token program
 */
export class OfferingBuy {
  free(): void;
  /**
   * @param {number} requestedBaseAmount
   * @returns {Uint8Array}
   */
  static getData(requestedBaseAmount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} dvdMintKey
   * @param {Uint8Array} doveMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, dvdMintKey: Uint8Array, doveMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Configuration for the offering system.
 */
export class OfferingConfig {
  free(): void;
  /**
   * @param {number} surplusLimit
   * @param {number} deficitLimit
   * @param {number} dvdOfferingSize
   * @param {number} doveOfferingSize
   */
  constructor(surplusLimit: number, deficitLimit: number, dvdOfferingSize: number, doveOfferingSize: number);
  readonly deficitLimit: number;
  readonly doveOfferingSize: number;
  readonly dvdOfferingSize: number;
  readonly surplusLimit: number;
}
/**
 * Ends the current world offering
 *
 * Accounts expected:
 *
 * 0. `[writable]` World account (PDA)
 */
export class OfferingEnd {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} program_key
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(program_key: Uint8Array): (AccountWasm)[];
}
/**
 * Starts a world offering if either the deficit or surplus exceeds their limit.
 *
 * Accounts expected:
 *
 * 0. `[writable]` World account (PDA)
 */
export class OfferingStart {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} oracleKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, oracleKey: Uint8Array): (AccountWasm)[];
}
export class Oracle {
  free(): void;
  /**
   * @param {OracleKind} kind
   * @param {Uint8Array} key
   */
  constructor(kind: OracleKind, key: Uint8Array);
  /**
   * @returns {Oracle}
   */
  static zero(): Oracle;
  /**
   * @param {Uint8Array} oracleKey
   * @param {Uint8Array} oracleData
   * @param {number} unixTimestamp
   * @returns {number}
   */
  getPriceNegativeIfStale(oracleKey: Uint8Array, oracleData: Uint8Array, unixTimestamp: number): number;
  readonly key: Uint8Array;
}
export class Page {
  free(): void;
  /**
   * @param {Book} book
   * @param {BookConfig} config
   * @param {number} unixTimestamp
   * @returns {number}
   */
  projectTotal(book: Book, config: BookConfig, unixTimestamp: number): number;
  /**
   * @param {Book} book
   * @param {number} unixTimestamp
   * @returns {number}
   */
  projectRewards(book: Book, unixTimestamp: number): number;
}
/**
 * The address of a [Solana account][acc].
 *
 * Some account addresses are [ed25519] public keys, with corresponding secret
 * keys that are managed off-chain. Often, though, account addresses do not
 * have corresponding secret keys &mdash; as with [_program derived
 * addresses_][pdas] &mdash; or the secret key is not relevant to the operation
 * of a program, and may have even been disposed of. As running Solana programs
 * can not safely create or manage secret keys, the full [`Keypair`] is not
 * defined in `solana-program` but in `solana-sdk`.
 *
 * [acc]: https://solana.com/docs/core/accounts
 * [ed25519]: https://ed25519.cr.yp.to/
 * [pdas]: https://solana.com/docs/core/cpi#program-derived-addresses
 * [`Keypair`]: https://docs.rs/solana-sdk/latest/solana_sdk/signer/keypair/struct.Keypair.html
 */
export class Pubkey {
  free(): void;
  /**
   * Create a new Pubkey object
   *
   * * `value` - optional public key as a base58 encoded string, `Uint8Array`, `[number]`
   * @param {any} value
   */
  constructor(value: any);
  /**
   * Return the base58 string representation of the public key
   * @returns {string}
   */
  toString(): string;
  /**
   * Check if a `Pubkey` is on the ed25519 curve.
   * @returns {boolean}
   */
  isOnCurve(): boolean;
  /**
   * Checks if two `Pubkey`s are equal
   * @param {Pubkey} other
   * @returns {boolean}
   */
  equals(other: Pubkey): boolean;
  /**
   * Return the `Uint8Array` representation of the public key
   * @returns {Uint8Array}
   */
  toBytes(): Uint8Array;
  /**
   * Derive a Pubkey from another Pubkey, string seed, and a program id
   * @param {Pubkey} base
   * @param {string} seed
   * @param {Pubkey} owner
   * @returns {Pubkey}
   */
  static createWithSeed(base: Pubkey, seed: string, owner: Pubkey): Pubkey;
  /**
   * Derive a program address from seeds and a program id
   * @param {any[]} seeds
   * @param {Pubkey} program_id
   * @returns {Pubkey}
   */
  static createProgramAddress(seeds: any[], program_id: Pubkey): Pubkey;
  /**
   * Find a valid program address
   *
   * Returns:
   * * `[PubKey, number]` - the program address and bump seed
   * @param {any[]} seeds
   * @param {Pubkey} program_id
   * @returns {any}
   */
  static findProgramAddress(seeds: any[], program_id: Pubkey): any;
}
export class Reserve {
  free(): void;
  readonly balance: number;
  readonly mintKey: Uint8Array;
}
export class Savings {
  free(): void;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @returns {Uint8Array}
   */
  static deriveKey(programKey: Uint8Array, userKey: Uint8Array): Uint8Array;
  /**
   * @param {Uint8Array} bytes
   * @returns {Savings}
   */
  static fromBytes(bytes: Uint8Array): Savings;
  readonly page: Page;
}
/**
 * Claims rewards from the savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` DOVE mint account
 * 4. `[writable]` DOVE token account (to receive rewards)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 */
export class SavingsClaimRewards {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} doveMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, doveMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Creates a new savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA, will be created)
 * 2. `[]` System program
 */
export class SavingsCreate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array): (AccountWasm)[];
}
/**
 * Deposits tokens into the savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` Debt token mint account
 * 4. `[writable]` Debt token account (to transfer tokens from)
 * 5. `[]` SPL Token program
 */
export class SavingsDeposit {
  free(): void;
  /**
   * @param {number} amount
   * @returns {Uint8Array}
   */
  static getData(amount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} doveMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, doveMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Withdraws tokens from the savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` Debt token mint account
 * 4. `[writable]` Debt token account (to transfer tokens to)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 */
export class SavingsWithdraw {
  free(): void;
  /**
   * @param {number} amount
   * @returns {Uint8Array}
   */
  static getData(amount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} doveMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, doveMintKey: Uint8Array): (AccountWasm)[];
}
export class Schedule {
  free(): void;
  /**
   * @param {number} maximum
   * @param {number} warmupLength
   * @param {number} totalLength
   */
  constructor(maximum: number, warmupLength: number, totalLength: number);
  /**
   * @param {number} t
   * @returns {number}
   */
  at(t: number): number;
  readonly maximum: number;
  readonly total_emission: number;
  readonly total_length: number;
  readonly warmup_length: number;
}
export class Sovereign {
  free(): void;
}
/**
 * Updates the sovereign of the world
 *
 * Accounts expected:
 *
 * 0. `[signer]` Current sovereign account
 * 1. `[]` New sovereign account
 * 2. `[writable]` World account (PDA)
 */
export class SovereignUpdate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} currentSovereignKey
   * @param {Uint8Array} newSovereignKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, currentSovereignKey: Uint8Array, newSovereignKey: Uint8Array): (AccountWasm)[];
}
/**
 * A liquidity pool allowing 1:1 swapping between on-demand minted DVD and a
 * blue-chip stablecoin. This helps to stabilize the market price of DVD.
 *
 * To protect against depegs, a `mint_limit` is set by governance: the maximum
 * amount, in USD, that the protocol is willing to lose in the event of a depeg.
 */
export class Stability {
  free(): void;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} stableMintKey
   * @returns {Uint8Array}
   */
  static deriveKey(programKey: Uint8Array, stableMintKey: Uint8Array): Uint8Array;
  /**
   * @param {Uint8Array} bytes
   * @returns {Stability}
   */
  static fromBytes(bytes: Uint8Array): Stability;
  readonly mintKey: Uint8Array;
  readonly mintLimit: number;
  readonly minted: number;
}
/**
 * Buys DVD from a stability pool
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (buyer)
 * 1. `[writable]` User's stable token account (to pay for DVD)
 * 2. `[writable]` User's DVD token account (to receive bought DVD)
 * 3. `[writable]` DVD mint account
 * 4. `[writable]` Stability safe account (to receive stable tokens)
 * 5. `[writable]` World account (PDA)
 * 6. `[writable]` Stability account (PDA)
 * 7. `[]` Authority account (PDA)
 * 8. `[]` SPL Token program
 */
export class StabilityBuyDvd {
  free(): void;
  /**
   * @param {number} amount
   * @returns {Uint8Array}
   */
  static getData(amount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} stableMintKey
   * @param {Uint8Array} dvdMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, stableMintKey: Uint8Array, dvdMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Creates a new stability pool in the system
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account (paying for account creation)
 * 1. `[writable]` Stability account (PDA, will be created)
 * 2. `[writable]` Safe account (PDA, will be created)
 * 3. `[]` Authority account (PDA)
 * 4. `[]` World account (PDA)
 * 5. `[]` Stable Mint account (for the stable token)
 * 6. `[]` System program
 * 7. `[]` SPL Token program
 */
export class StabilityCreate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} sovereignKey
   * @param {Uint8Array} stableMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, sovereignKey: Uint8Array, stableMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Sells DVD to the stability pool in exchange for stable tokens
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (seller)
 * 1. `[writable]` DVD source token account (to sell DVD from)
 * 2. `[writable]` DVD token mint account
 * 3. `[writable]` Safe account (to take stable tokens from)
 * 4. `[writable]` Stable token destination account (to receive stable tokens)
 * 5. `[writable]` World account (PDA)
 * 6. `[writable]` Stability account (PDA)
 * 7. `[]` Authority account (PDA)
 * 8. `[]` SPL Token program
 */
export class StabilitySellDvd {
  free(): void;
  /**
   * @param {number} amount
   * @returns {Uint8Array}
   */
  static getData(amount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} dvdMintKey
   * @param {Uint8Array} stableMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, dvdMintKey: Uint8Array, stableMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Updates the mint limit for a stability pool
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` Stability account (PDA)
 * 2. `[]` World account (PDA)
 */
export class StabilityUpdateMintLimit {
  free(): void;
  /**
   * @param {number} newMintLimit
   * @returns {Uint8Array}
   */
  static getData(newMintLimit: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} sovereignKey
   * @param {Uint8Array} stableMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, sovereignKey: Uint8Array, stableMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * The total number of DVD minted with Stability modules.
 * This is just a tracking number, and should be kept in sync with
 * (but does not affect) the actual circulating supply.
 */
export class StableDvd {
  free(): void;
  readonly circulating: number;
}
/**
 * A token controlled by the Authority.
 */
export class Token {
  free(): void;
  readonly decimals: number;
  readonly mint: Uint8Array;
  readonly supply: number;
}
/**
 * wasm-bindgen version of the Transaction struct.
 * This duplication is required until https://github.com/rustwasm/wasm-bindgen/issues/3671
 * is fixed. This must not diverge from the regular non-wasm Transaction struct.
 */
export class Transaction {
  free(): void;
  /**
   * Create a new `Transaction`
   * @param {Instructions} instructions
   * @param {Pubkey | undefined} [payer]
   */
  constructor(instructions: Instructions, payer?: Pubkey);
  /**
   * Return a message containing all data that should be signed.
   * @returns {Message}
   */
  message(): Message;
  /**
   * Return the serialized message data to sign.
   * @returns {Uint8Array}
   */
  messageData(): Uint8Array;
  /**
   * Verify the transaction
   */
  verify(): void;
  /**
   * @param {Keypair} keypair
   * @param {Hash} recent_blockhash
   */
  partialSign(keypair: Keypair, recent_blockhash: Hash): void;
  /**
   * @returns {boolean}
   */
  isSigned(): boolean;
  /**
   * @returns {Uint8Array}
   */
  toBytes(): Uint8Array;
  /**
   * @param {Uint8Array} bytes
   * @returns {Transaction}
   */
  static fromBytes(bytes: Uint8Array): Transaction;
}
/**
 * A user-controlled oracle.
 *
 * It's useful for:
 * 1. Debugging: Developers can set custom prices for testing.
 * 2. Initial implementation: For newly launched tokens or assets without established external price feeds.
 *    For example, when this program is first launched, DOVE will not have an external price feed.
 * 3. Flexibility: Other account types can be deserialized as UserFeed,
 *    allowing easy extension of oracle functionality
 *    without modifying the core implementation.
 */
export class UserFeed {
  free(): void;
  /**
   * @param {Uint8Array} program_key
   * @param {Uint8Array} user_key
   * @param {number} index
   * @returns {Uint8Array}
   */
  static derive_key(program_key: Uint8Array, user_key: Uint8Array, index: number): Uint8Array;
}
/**
 * Creates a new user feed account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` UserFeed account (PDA, will be created)
 * 2. `[]` System program
 */
export class UserFeedCreate {
  free(): void;
  /**
   * @param {number} index
   * @returns {Uint8Array}
   */
  static getData(index: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {number} index
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, index: number): (AccountWasm)[];
}
/**
 * Sets the price for a user feed
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (owner of the UserFeed)
 * 1. `[writable]` UserFeed account (PDA)
 */
export class UserFeedSetPrice {
  free(): void;
  /**
   * @param {number} price
   * @returns {Uint8Array}
   */
  static getData(price: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {number} index
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, index: number): (AccountWasm)[];
}
export class Vault {
  free(): void;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @returns {Uint8Array}
   */
  static deriveKey(programKey: Uint8Array, userKey: Uint8Array): Uint8Array;
  /**
   * @param {Uint8Array} bytes
   * @returns {Vault}
   */
  static fromBytes(bytes: Uint8Array): Vault;
  /**
   * @param {number} index
   * @param {number} unixTimestamp
   * @param {AuctionConfig} config
   * @returns {number | undefined}
   */
  calculateAuctionPrice(index: number, unixTimestamp: number, config: AuctionConfig): number | undefined;
  /**
   * @param {number} unixTimestamp
   * @returns {number | undefined}
   */
  getAuctionSecsElapsed(unixTimestamp: number): number | undefined;
  /**
   * @param {number} unixTimestamp
   * @param {AuctionConfig} config
   * @returns {boolean | undefined}
   */
  isAuctionOver(unixTimestamp: number, config: AuctionConfig): boolean | undefined;
  /**
   * @param {AuctionConfig} config
   * @param {number} index
   * @returns {number | undefined}
   */
  getAuctionFailPrice(config: AuctionConfig, index: number): number | undefined;
  readonly debt: Page;
  readonly isDebtZero: boolean;
  readonly isLiquidated: boolean;
  readonly reserves: (Reserve)[];
}
/**
 * Borrows tokens from the world
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Mint account (for the DVD)
 * 2. `[writable]` Debt token account (to receive borrowed tokens)
 * 3. `[writable]` World account (PDA)
 * 4. `[writable]` Vault account (PDA)
 * 5. `[]` Authority account (PDA)
 * 6. `[]` SPL Token program
 * 7..n. `[]` Collateral accounts in order of vault reserves (PDAs)
 * n..m. `[]` Oracle accounts in order of vault reserves (PDAs)
 */
export class VaultBorrow {
  free(): void;
  /**
   * @param {number} requestedAmount
   * @returns {Uint8Array}
   */
  static getData(requestedAmount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} dvdMintKey
   * @param {any[]} collateralMintKeys
   * @param {any[]} oracleKeys
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, dvdMintKey: Uint8Array, collateralMintKeys: any[], oracleKeys: any[]): (AccountWasm)[];
}
/**
 * Buys collateral from a liquidated vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (buyer)
 * 1. `[writable]` DVD token account (to pay for collateral)
 * 2. `[writable]` DVD token mint account
 * 3. `[writable]` Safe account (to take bought collateral from)
 * 4. `[writable]` Collateral destination token account (to receive bought collateral)
 * 5. `[writable]` World account (PDA)
 * 6. `[writable]` Vault account (PDA)
 * 7. `[]` Authority account (PDA)
 * 8. `[]` SPL Token program
 * 9. `[writable]` Collateral account (PDA)
 */
export class VaultBuyCollateral {
  free(): void;
  /**
   * @param {number} requestedDvdAmount
   * @param {number} collateralIndex
   * @returns {Uint8Array}
   */
  static getData(requestedDvdAmount: number, collateralIndex: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} vaultKey
   * @param {Uint8Array} dvdMintKey
   * @param {Uint8Array} collateralMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, vaultKey: Uint8Array, dvdMintKey: Uint8Array, collateralMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Claims rewards from the vault account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` DOVE mint account
 * 4. `[writable]` DOVE token account (to receive rewards)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 */
export class VaultClaimRewards {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} doveMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, doveMintKey: Uint8Array): (AccountWasm)[];
}
export class VaultConfig {
  free(): void;
  /**
   * @param {number} liquidationPenaltyRate
   * @param {number} liquidationRewardCap
   * @param {number} liquidationRewardRate
   * @param {number} auctionFailureRewardCap
   * @param {number} auctionFailureRewardRate
   */
  constructor(liquidationPenaltyRate: number, liquidationRewardCap: number, liquidationRewardRate: number, auctionFailureRewardCap: number, auctionFailureRewardRate: number);
  /**
   * @returns {VaultConfig}
   */
  static zero(): VaultConfig;
  readonly auctionFailureRewardCap: number;
  readonly auctionFailureRewardRate: number;
  readonly liquidationRewardCap: number;
  readonly liquidationRewardRate: number;
}
/**
 * Creates a new vault account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA, will be created)
 * 2. `[]` System program
 */
export class VaultCreate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array): (AccountWasm)[];
}
/**
 * Creates a new reserve in a vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` Collateral account (PDA)
 */
export class VaultCreateReserve {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} collateralMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, collateralMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Deposits tokens into a vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` Collateral account (PDA)
 * 3. `[writable]` User's token account (source of tokens)
 * 4. `[writable]` Collateral's token account (destination for tokens)
 * 5. `[]` SPL Token program
 */
export class VaultDeposit {
  free(): void;
  /**
   * @param {number} amount
   * @returns {Uint8Array}
   */
  static getData(amount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} collateralMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, collateralMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Fails the auction for a liquidated vault
 *
 * Accounts expected:
 * 0. `[writable]` Vault account (PDA) for which to fail the auction
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` Debt token mint account
 * 3. `[writable]` Debt token account (to receive auction failure reward)
 * 4. `[]` Authority account (PDA)
 * 5. `[]` SPL Token program
 */
export class VaultFailAuction {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} vaultKey
   * @param {Uint8Array} dvdMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, vaultKey: Uint8Array, dvdMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Liquidates a vault
 *
 * Accounts expected:
 *
 * 0. `[writable]` Debt token mint account
 * 1. `[writable]` Debt token account (to receive liquidation reward)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` Vault account (PDA) to be liquidated
 * 4. `[]` Authority account (PDA)
 * 5. `[]` SPL Token program
 * 6..n. `[]` Collateral accounts in order of vault reserves (PDAs)
 * n..m. `[]` Oracle accounts in order of vault reserves (PDAs)
 */
export class VaultLiquidate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} vaultKey
   * @param {Uint8Array} dvdMintKey
   * @param {any[]} collateralMintKeys
   * @param {any[]} oracleKeys
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, vaultKey: Uint8Array, dvdMintKey: Uint8Array, collateralMintKeys: any[], oracleKeys: any[]): (AccountWasm)[];
}
/**
 * Removes a reserve from a vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[]` Collateral mint account
 */
export class VaultRemoveReserve {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} collateralMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, collateralMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Repays borrowed DVD to the vault
 *
 * Accounts expected:
 * 0. `[signer]` User account
 * 1. `[writable]` Debt token account (must be owned by user)
 * 2. `[writable]` Mint account (for the DVD)
 * 3. `[writable]` World account (PDA)
 * 4. `[writable]` Vault account (PDA)
 * 5. `[]` SPL Token program
 */
export class VaultRepay {
  free(): void;
  /**
   * @param {number} requestedAmount
   * @returns {Uint8Array}
   */
  static getData(requestedAmount: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} dvdMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, dvdMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Unliquidates a vault
 *
 * Accounts expected:
 * 0. `[writable]` Vault account (PDA) to be unliquidated
 */
export class VaultUnliquidate {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} vaultKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(vaultKey: Uint8Array): (AccountWasm)[];
}
/**
 * Withdraws tokens from a vault
 *
 * Accounts expected:
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` User's token account (destination for tokens)
 * 4. `[writable]` Safe account (source of tokens)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 * 7..n. `[writable]` Collateral accounts for reserves in the vault, in order (PDAs)
 * n..m. `[]` Oracle accounts for reserves in the vault, in order
 */
export class VaultWithdraw {
  free(): void;
  /**
   * @param {number} requestedAmount
   * @param {number} reserveIndex
   * @returns {Uint8Array}
   */
  static getData(requestedAmount: number, reserveIndex: number): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {any[]} collateralMintKeys
   * @param {any[]} oracleKeys
   * @param {number} reserveIndex
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, collateralMintKeys: any[], oracleKeys: any[], reserveIndex: number): (AccountWasm)[];
}
export class Vesting {
  free(): void;
  /**
   * @param {number} unixTimestamp
   * @returns {number}
   */
  getEmissionDue(unixTimestamp: number): number;
  readonly distributed: number;
  readonly recipient: Uint8Array;
  readonly schedule: Schedule;
}
/**
 * Claims vesting rewards
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` DOVE mint account
 * 3. `[writable]` DOVE token account (to receive rewards)
 * 4. `[]` SPL Token program
 * 5. `[]` Authority account (PDA)
 */
export class VestingClaim {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} userKey
   * @param {Uint8Array} doveMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, userKey: Uint8Array, doveMintKey: Uint8Array): (AccountWasm)[];
}
/**
 * Updates the recipient of a vesting account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Current recipient account
 * 1. `[writable]` World account (PDA)
 * 2. `[]` New recipient account
 */
export class VestingUpdateRecipient {
  free(): void;
  /**
   * @returns {Uint8Array}
   */
  static getData(): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} currentRecipientKey
   * @param {Uint8Array} newRecipientKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, currentRecipientKey: Uint8Array, newRecipientKey: Uint8Array): (AccountWasm)[];
}
/**
 * The struct containing all global state.
 * 
 * **Safety**: Never overwrite the fields of this struct directly (/world\.(.+) = /).
 * Doing so is unsafe and violates critical invariants.
 * Always use the associated functions on the state objects to modify state.
 */
export class World {
  free(): void;
  /**
   * @param {Uint8Array} program_key
   * @returns {Uint8Array}
   */
  static deriveKey(program_key: Uint8Array): Uint8Array;
  /**
   * @param {Uint8Array} bytes
   * @returns {World}
   */
  static fromBytes(bytes: Uint8Array): World;
  /**
   * @returns {World}
   */
  static zero(): World;
  config: Config;
  debt: Book;
  dove: Token;
  dvd: Token;
  readonly flashMint: FlashMint;
  
  offering: Offering;
  savings: Book;
  sovereign: Sovereign;
  readonly stableDvd: StableDvd;
  
  vesting: Vesting;
}
/**
 * Creates the program's world account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` World account (PDA, will be created)
 * 2. `[]` Authority account (PDA)
 * 3. `[]` Mint account for the DVD
 * 4. `[]` Mint account for the DOVE
 * 5. `[]` System program
 */
export class WorldCreate {
  free(): void;
  /**
   * @param {Schedule} debtSchedule
   * @param {Schedule} savingsSchedule
   * @param {Uint8Array} vestingRecipient
   * @param {Schedule} vestingSchedule
   * @returns {Uint8Array}
   */
  static getData(debtSchedule: Schedule, savingsSchedule: Schedule, vestingRecipient: Uint8Array, vestingSchedule: Schedule): Uint8Array;
  /**
   * @param {Uint8Array} programKey
   * @param {Uint8Array} sovereignKey
   * @param {Uint8Array} dvdMintKey
   * @param {Uint8Array} doveMintKey
   * @returns {(AccountWasm)[]}
   */
  static getAccounts(programKey: Uint8Array, sovereignKey: Uint8Array, dvdMintKey: Uint8Array, doveMintKey: Uint8Array): (AccountWasm)[];
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_authoritycreate_free: (a: number, b: number) => void;
  readonly authoritycreate_getData: (a: number) => void;
  readonly authoritycreate_getAccounts: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly collateralcreate_getData: (a: number) => void;
  readonly collateralcreate_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly collateralsetoracle_getData: (a: number, b: number, c: number, d: number) => void;
  readonly collateralsetoracle_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly collateralupdatemaxdeposit_getData: (a: number, b: number) => void;
  readonly configupdate_getData: (a: number, b: number) => void;
  readonly configupdate_getAccounts: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly flashmintbegin_getData: (a: number, b: number) => void;
  readonly flashmintbegin_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly flashmintend_getData: (a: number) => void;
  readonly flashmintend_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly offeringbuy_getData: (a: number, b: number) => void;
  readonly offeringbuy_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly offeringend_getData: (a: number) => void;
  readonly offeringend_getAccounts: (a: number, b: number, c: number) => void;
  readonly offeringstart_getData: (a: number) => void;
  readonly offeringstart_getAccounts: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly savingsclaimrewards_getData: (a: number) => void;
  readonly savingsclaimrewards_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly savingscreate_getData: (a: number) => void;
  readonly savingscreate_getAccounts: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly savingsdeposit_getData: (a: number, b: number) => void;
  readonly savingsdeposit_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly savingswithdraw_getData: (a: number, b: number) => void;
  readonly sovereignupdate_getData: (a: number) => void;
  readonly sovereignupdate_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly stabilitycreate_getData: (a: number) => void;
  readonly stabilitycreate_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly stabilitybuydvd_getData: (a: number, b: number) => void;
  readonly stabilitybuydvd_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly stabilityselldvd_getData: (a: number, b: number) => void;
  readonly stabilityselldvd_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly stabilityupdatemintlimit_getData: (a: number, b: number) => void;
  readonly stabilityupdatemintlimit_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly __wbg_userfeedcreate_free: (a: number, b: number) => void;
  readonly userfeedcreate_getData: (a: number, b: number) => void;
  readonly userfeedcreate_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly userfeedsetprice_getData: (a: number, b: number) => void;
  readonly userfeedsetprice_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly vaultborrow_getData: (a: number, b: number) => void;
  readonly vaultborrow_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly vaultbuycollateral_getData: (a: number, b: number, c: number) => void;
  readonly vaultbuycollateral_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly vaultclaimrewards_getData: (a: number) => void;
  readonly vaultclaimrewards_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly vaultcreate_getData: (a: number) => void;
  readonly vaultcreate_getAccounts: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly vaultcreatereserve_getData: (a: number) => void;
  readonly vaultcreatereserve_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly vaultdeposit_getData: (a: number, b: number) => void;
  readonly vaultdeposit_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly vaultfailauction_getData: (a: number) => void;
  readonly vaultfailauction_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly vaultliquidate_getData: (a: number) => void;
  readonly vaultliquidate_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => void;
  readonly vaultremovereserve_getData: (a: number) => void;
  readonly vaultremovereserve_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly vaultrepay_getData: (a: number, b: number) => void;
  readonly vaultrepay_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly vaultunliquidate_getData: (a: number) => void;
  readonly vaultunliquidate_getAccounts: (a: number, b: number, c: number) => void;
  readonly vaultwithdraw_getData: (a: number, b: number, c: number) => void;
  readonly vaultwithdraw_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly vestingclaim_getData: (a: number) => void;
  readonly vestingclaim_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly vestingupdaterecipient_getData: (a: number) => void;
  readonly vestingupdaterecipient_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly __wbg_worldcreate_free: (a: number, b: number) => void;
  readonly worldcreate_getData: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly worldcreate_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly __wbg_auctionconfig_free: (a: number, b: number) => void;
  readonly auctionconfig_new: (a: number, b: number, c: number, d: number) => void;
  readonly auctionconfig_zero: () => number;
  readonly auctionconfig_beginScale: (a: number) => number;
  readonly auctionconfig_decayRate: (a: number) => number;
  readonly auctionconfig_endScale: (a: number) => number;
  readonly __wbg_bookconfig_free: (a: number, b: number) => void;
  readonly bookconfig_new: (a: number) => number;
  readonly bookconfig_apy: (a: number) => number;
  readonly __wbg_book_free: (a: number, b: number) => void;
  readonly book_projectTotal: (a: number, b: number, c: number) => number;
  readonly book_projectRewards: (a: number, b: number) => number;
  readonly book_rewardSchedule: (a: number) => number;
  readonly book_creationTime: (a: number) => number;
  readonly decimal_tokenAmountToNumber: (a: number, b: number) => number;
  readonly decimal_numberToTokenAmount: (a: number, b: number) => number;
  readonly page_projectTotal: (a: number, b: number, c: number, d: number) => number;
  readonly page_projectRewards: (a: number, b: number, c: number) => number;
  readonly schedule_new: (a: number, b: number, c: number, d: number) => void;
  readonly schedule_at: (a: number, b: number) => number;
  readonly schedule_total_emission: (a: number) => number;
  readonly oracle_new_wasm: (a: number, b: number, c: number, d: number) => void;
  readonly oracle_key: (a: number, b: number) => void;
  readonly oracle_zero: () => number;
  readonly oracle_getPriceNegativeIfStale: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly userfeed_derive_key: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbg_config_free: (a: number, b: number) => void;
  readonly config_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly config_doveOracle: (a: number) => number;
  readonly config_auctionConfig: (a: number) => number;
  readonly config_debtConfig: (a: number) => number;
  readonly config_flashMintConfig: (a: number) => number;
  readonly config_offeringConfig: (a: number) => number;
  readonly config_savingsConfig: (a: number) => number;
  readonly config_vaultConfig: (a: number) => number;
  readonly __wbg_flashmintconfig_free: (a: number, b: number) => void;
  readonly flashmintconfig_new: (a: number, b: number) => number;
  readonly __wbg_flashmint_free: (a: number, b: number) => void;
  readonly __wbg_offeringconfig_free: (a: number, b: number) => void;
  readonly offeringconfig_new: (a: number, b: number, c: number, d: number) => number;
  readonly offeringconfig_doveOfferingSize: (a: number) => number;
  readonly offering_amount: (a: number) => number;
  readonly offering_getPrice: (a: number, b: number, c: number) => number;
  readonly offering_isActive: (a: number) => number;
  readonly offering_getSecsElapsed: (a: number, b: number) => number;
  readonly offering_getFailPrice: (a: number, b: number) => number;
  readonly offering_isDvd: (a: number) => number;
  readonly __wbg_sovereign_free: (a: number, b: number) => void;
  readonly __wbg_vesting_free: (a: number, b: number) => void;
  readonly vesting_recipient: (a: number, b: number) => void;
  readonly vesting_schedule: (a: number) => number;
  readonly vesting_getEmissionDue: (a: number, b: number) => number;
  readonly vesting_distributed: (a: number) => number;
  readonly __wbg_authority_free: (a: number, b: number) => void;
  readonly authority_deriveKey: (a: number, b: number, c: number) => void;
  readonly __wbg_collateral_free: (a: number, b: number) => void;
  readonly collateral_deriveKey: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly collateral_fromBytes: (a: number, b: number, c: number) => void;
  readonly collateral_oracle: (a: number) => number;
  readonly collateral_decimals: (a: number) => number;
  readonly collateral_deposited: (a: number) => number;
  readonly collateral_maxDeposit: (a: number) => number;
  readonly __wbg_savings_free: (a: number, b: number) => void;
  readonly savings_deriveKey: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly savings_fromBytes: (a: number, b: number, c: number) => void;
  readonly savings_page: (a: number) => number;
  readonly stability_deriveKey: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly stability_fromBytes: (a: number, b: number, c: number) => void;
  readonly stability_mintKey: (a: number, b: number) => void;
  readonly __wbg_vaultconfig_free: (a: number, b: number) => void;
  readonly vaultconfig_new: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly vaultconfig_zero: () => number;
  readonly vaultconfig_auctionFailureRewardRate: (a: number) => number;
  readonly __wbg_vault_free: (a: number, b: number) => void;
  readonly vault_deriveKey: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly vault_fromBytes: (a: number, b: number, c: number) => void;
  readonly vault_reserves: (a: number, b: number) => void;
  readonly vault_debt: (a: number) => number;
  readonly vault_isDebtZero: (a: number) => number;
  readonly vault_isLiquidated: (a: number) => number;
  readonly vault_calculateAuctionPrice: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly vault_getAuctionSecsElapsed: (a: number, b: number, c: number) => void;
  readonly vault_isAuctionOver: (a: number, b: number, c: number) => number;
  readonly vault_getAuctionFailPrice: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_world_free: (a: number, b: number) => void;
  readonly __wbg_get_world_dove: (a: number) => number;
  readonly __wbg_set_world_dove: (a: number, b: number) => void;
  readonly __wbg_get_world_dvd: (a: number) => number;
  readonly __wbg_set_world_dvd: (a: number, b: number) => void;
  readonly __wbg_get_world_debt: (a: number) => number;
  readonly __wbg_set_world_debt: (a: number, b: number) => void;
  readonly __wbg_get_world_savings: (a: number) => number;
  readonly __wbg_set_world_savings: (a: number, b: number) => void;
  readonly __wbg_get_world_stable_dvd: (a: number) => number;
  readonly __wbg_set_world_stable_dvd: (a: number, b: number) => void;
  readonly __wbg_get_world_offering: (a: number) => number;
  readonly __wbg_set_world_offering: (a: number, b: number) => void;
  readonly __wbg_get_world_flash_mint: (a: number) => number;
  readonly __wbg_set_world_flash_mint: (a: number, b: number) => void;
  readonly __wbg_get_world_sovereign: (a: number) => number;
  readonly __wbg_set_world_sovereign: (a: number, b: number) => void;
  readonly __wbg_get_world_vesting: (a: number) => number;
  readonly __wbg_set_world_vesting: (a: number, b: number) => void;
  readonly __wbg_get_world_config: (a: number) => number;
  readonly __wbg_set_world_config: (a: number, b: number) => void;
  readonly world_deriveKey: (a: number, b: number, c: number) => void;
  readonly world_fromBytes: (a: number, b: number, c: number) => void;
  readonly world_zero: () => number;
  readonly world_stableDvd: (a: number) => number;
  readonly world_flashMint: (a: number) => number;
  readonly reserve_mintKey: (a: number, b: number) => void;
  readonly __wbg_token_free: (a: number, b: number) => void;
  readonly token_decimals: (a: number) => number;
  readonly token_mint: (a: number, b: number) => void;
  readonly __wbg_accountwasm_free: (a: number, b: number) => void;
  readonly accountwasm_get_key: (a: number, b: number) => void;
  readonly accountwasm_is_signer: (a: number) => number;
  readonly accountwasm_is_writable: (a: number) => number;
  readonly entrypoint: (a: number) => number;
  readonly schedule_maximum: (a: number) => number;
  readonly schedule_warmup_length: (a: number) => number;
  readonly schedule_total_length: (a: number) => number;
  readonly config_maxLtv: (a: number) => number;
  readonly flashmintconfig_fee: (a: number) => number;
  readonly flashmintconfig_limit: (a: number) => number;
  readonly offeringconfig_surplusLimit: (a: number) => number;
  readonly offeringconfig_deficitLimit: (a: number) => number;
  readonly offeringconfig_dvdOfferingSize: (a: number) => number;
  readonly stabledvd_circulating: (a: number) => number;
  readonly stability_minted: (a: number) => number;
  readonly stability_mintLimit: (a: number) => number;
  readonly vaultconfig_liquidationRewardCap: (a: number) => number;
  readonly vaultconfig_liquidationRewardRate: (a: number) => number;
  readonly vaultconfig_auctionFailureRewardCap: (a: number) => number;
  readonly reserve_balance: (a: number) => number;
  readonly token_supply: (a: number) => number;
  readonly savingswithdraw_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly __wbg_collateralcreate_free: (a: number, b: number) => void;
  readonly __wbg_flashmintbegin_free: (a: number, b: number) => void;
  readonly __wbg_flashmintend_free: (a: number, b: number) => void;
  readonly __wbg_offeringbuy_free: (a: number, b: number) => void;
  readonly __wbg_offeringend_free: (a: number, b: number) => void;
  readonly __wbg_offeringstart_free: (a: number, b: number) => void;
  readonly __wbg_savingsclaimrewards_free: (a: number, b: number) => void;
  readonly __wbg_savingscreate_free: (a: number, b: number) => void;
  readonly __wbg_savingsdeposit_free: (a: number, b: number) => void;
  readonly __wbg_savingswithdraw_free: (a: number, b: number) => void;
  readonly __wbg_sovereignupdate_free: (a: number, b: number) => void;
  readonly __wbg_stabilitycreate_free: (a: number, b: number) => void;
  readonly __wbg_stabilitybuydvd_free: (a: number, b: number) => void;
  readonly __wbg_stabilityselldvd_free: (a: number, b: number) => void;
  readonly __wbg_stabilityupdatemintlimit_free: (a: number, b: number) => void;
  readonly __wbg_userfeedsetprice_free: (a: number, b: number) => void;
  readonly __wbg_vaultborrow_free: (a: number, b: number) => void;
  readonly __wbg_vaultclaimrewards_free: (a: number, b: number) => void;
  readonly __wbg_vaultcreate_free: (a: number, b: number) => void;
  readonly __wbg_vaultcreatereserve_free: (a: number, b: number) => void;
  readonly __wbg_vaultdeposit_free: (a: number, b: number) => void;
  readonly __wbg_vaultfailauction_free: (a: number, b: number) => void;
  readonly __wbg_vaultliquidate_free: (a: number, b: number) => void;
  readonly __wbg_vaultremovereserve_free: (a: number, b: number) => void;
  readonly __wbg_vaultrepay_free: (a: number, b: number) => void;
  readonly __wbg_vaultunliquidate_free: (a: number, b: number) => void;
  readonly __wbg_vaultwithdraw_free: (a: number, b: number) => void;
  readonly __wbg_vestingclaim_free: (a: number, b: number) => void;
  readonly __wbg_vestingupdaterecipient_free: (a: number, b: number) => void;
  readonly __wbg_collateralupdatemaxdeposit_free: (a: number, b: number) => void;
  readonly __wbg_decimal_free: (a: number, b: number) => void;
  readonly __wbg_schedule_free: (a: number, b: number) => void;
  readonly __wbg_oracle_free: (a: number, b: number) => void;
  readonly __wbg_vaultbuycollateral_free: (a: number, b: number) => void;
  readonly __wbg_configupdate_free: (a: number, b: number) => void;
  readonly __wbg_userfeed_free: (a: number, b: number) => void;
  readonly __wbg_page_free: (a: number, b: number) => void;
  readonly __wbg_offering_free: (a: number, b: number) => void;
  readonly __wbg_stabledvd_free: (a: number, b: number) => void;
  readonly __wbg_stability_free: (a: number, b: number) => void;
  readonly __wbg_reserve_free: (a: number, b: number) => void;
  readonly __wbg_collateralsetoracle_free: (a: number, b: number) => void;
  readonly collateralupdatemaxdeposit_getAccounts: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly __wbg_keypair_free: (a: number, b: number) => void;
  readonly __wbg_transaction_free: (a: number, b: number) => void;
  readonly keypair_constructor: () => number;
  readonly keypair_toBytes: (a: number, b: number) => void;
  readonly keypair_fromBytes: (a: number, b: number, c: number) => void;
  readonly keypair_pubkey: (a: number) => number;
  readonly transaction_constructor: (a: number, b: number) => number;
  readonly transaction_message: (a: number) => number;
  readonly transaction_messageData: (a: number, b: number) => void;
  readonly transaction_verify: (a: number, b: number) => void;
  readonly transaction_partialSign: (a: number, b: number, c: number) => void;
  readonly transaction_isSigned: (a: number) => number;
  readonly transaction_toBytes: (a: number, b: number) => void;
  readonly transaction_fromBytes: (a: number, b: number, c: number) => void;
  readonly __wbg_hash_free: (a: number, b: number) => void;
  readonly __wbg_instruction_free: (a: number, b: number) => void;
  readonly __wbg_message_free: (a: number, b: number) => void;
  readonly __wbg_get_message_recent_blockhash: (a: number) => number;
  readonly __wbg_set_message_recent_blockhash: (a: number, b: number) => void;
  readonly hash_constructor: (a: number, b: number) => void;
  readonly hash_toString: (a: number, b: number) => void;
  readonly hash_equals: (a: number, b: number) => number;
  readonly hash_toBytes: (a: number, b: number) => void;
  readonly __wbg_instructions_free: (a: number, b: number) => void;
  readonly instructions_constructor: () => number;
  readonly instructions_push: (a: number, b: number) => void;
  readonly pubkey_constructor: (a: number, b: number) => void;
  readonly pubkey_isOnCurve: (a: number) => number;
  readonly pubkey_createWithSeed: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly pubkey_createProgramAddress: (a: number, b: number, c: number, d: number) => void;
  readonly pubkey_findProgramAddress: (a: number, b: number, c: number, d: number) => void;
  readonly systeminstruction_createAccount: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly systeminstruction_createAccountWithSeed: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly systeminstruction_assign: (a: number, b: number) => number;
  readonly systeminstruction_assignWithSeed: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly systeminstruction_transfer: (a: number, b: number, c: number) => number;
  readonly systeminstruction_transferWithSeed: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly systeminstruction_allocate: (a: number, b: number) => number;
  readonly systeminstruction_allocateWithSeed: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly systeminstruction_createNonceAccount: (a: number, b: number, c: number, d: number) => number;
  readonly systeminstruction_advanceNonceAccount: (a: number, b: number) => number;
  readonly systeminstruction_withdrawNonceAccount: (a: number, b: number, c: number, d: number) => number;
  readonly systeminstruction_authorizeNonceAccount: (a: number, b: number, c: number) => number;
  readonly pubkey_toBytes: (a: number, b: number) => void;
  readonly __wbg_pubkey_free: (a: number, b: number) => void;
  readonly solana_program_init: () => void;
  readonly pubkey_equals: (a: number, b: number) => number;
  readonly pubkey_toString: (a: number, b: number) => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_2: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_3: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

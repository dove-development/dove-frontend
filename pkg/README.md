# dove
## Building for Solana
This option builds the DoveDAO smart contract.

Install the Solana CLI:
```sh
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```
Then, build the project:
```sh
./build_solana.sh
```
The product is `target/deploy/dove.so`.

## Building for WebAssembly
This option builds the WebAssembly library, exposing DoveDAO's primitives to TypeScript and JavaScript.

```sh
./build_wasm.sh
```

Dove primitives can then be imported via `import { ... } from "pkg/dove"`.

The script builds the library in `web` mode, which means that the library [must be initialized](https://rustwasm.github.io/wasm-bindgen/examples/without-a-bundler.html).

## What is it
DoveDAO is essentially a clone of MakerDAO on Solana, minus the centralization aspect.

## Rationale behind the landing page
The landing page for DoveDAO intends to balance the interests of three stakeholders, and show all how they can be benefited by the protocol:
1. Holders of DVD: Sections B and C aim to convince holders that DVD is more secure than other stablecoins (it is independent from any centralized entities), and also more profitable (6% APY).
2. Minters of DVD: Section D aims to attract users who want to unlock the value of their assets without selling them, by offering the ability to mint DVD against their collateral.
3. Investors in DOVE: Section E highlights the deflationary mechanism of DOVE tokens, appealing to potential investors.

## Landing page
#### a: A stablecoin free from central control
Dove USD (DVD) is a stable and secure currency backed by on-chain assets.
#### b: Secure your savings
Protect your savings from market volatility with DVD, a stablecoin backed only by decentralized assets, eliminating the risk of centralized failure.
#### c: Earn passive income
Stake your DVD tokens to earn 6% APY, and unstake at any time.
#### d: Unlock your assets' potential
Deposit unused assets as collateral to mint DVD at 7% APY.
#### e: Governed by the community
DOVE token holders form the DoveDAO, which governs the protocol and shapes the future of DeFi on Solana.
#### f: Token buyback mechanism
Excess interest from DVD vaults is used by the protocol to buy back and burn DOVE tokens.
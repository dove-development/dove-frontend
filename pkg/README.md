# dove
## Building for Solana
This option builds the DoveDAO smart contract.

Install the Solana CLI:
```sh
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```
Then, build the project:
```sh
cargo build-sbf
```
The product is `target/deploy/dove.so`.

## Building for WebAssembly
This option builds the WebAssembly library, exposing the primitives of the Dove protocol to TypeScript and JavaScript.

```sh
wasm-pack build --target nodejs --release --out-dir ./pkg -- --features wasm
```

Dove primitives can then be imported via `import { ... } from "pkg/dove"`.

## Deploying to the frontend
To build the `web` version for `dove-frontend`, simply run:
```sh
./deploy_frontend.sh
```
which expects the `dove-frontend` repository to be cloned at `../dove-frontend`.

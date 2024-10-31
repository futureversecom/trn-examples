# FuturePass Multisignature

Scripts to use FuturePass proxy extrinsic to multi sig an extrinsic

## Examples

````bash
# change your working directory to this example first
cd examples/substrate/use-fp-multisig-wallet
# export all required environments
export CALLER_PRIVATE_KEY=

Steps:

1. `createMultiSigWallet` - parameter of `signatores` (`-s`), `name` (`-n`) and `threshold` (`-t`)

 Can replace signatores, threshold and wallet name in createMultiSigWallet script

```bash
pnpm call:createMultiSigWallet
````

2. Fund the multisig wallet address created above with some xrp,
   Can update the multiSigWallet address in script

```bash
pnpm call:fundMultiSigWallet
```

3. Create futurepass proxy extrinsic
   Update the caller seed `CALLER_PRIVATE_KEY` and signatories

```bash
pnpm call:createProxyExtrinsic
```

4. Sign the multisig extrinsic with by other holder
   Update the caller seed `CALLER_PRIVATE_KEY` to other holder and signatories

```bash
pnpm call:signBySecondHolder
```

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

# Multisig Pallet

[![Run in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fsubstrate%2Fuse-multisig%2FREADME.md&title=Futurepass%20Pallet%20Examples) [![Pallet Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com/buidl/substrate/pallet-multisig)

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_1_PRIVATE_KEY` - Private key of account #1 that submits the multisig transaction.
> - `CALLER_2_PRIVATE_KEY` - Private key of account #2 that submits the multisig transaction.
> - `CALLER_3_PRIVATE_KEY` - Private key of account #3 that submits the multisig transaction.

> Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/substrate/use-multisig

# export all required environments
export CALLER_1_PRIVATE_KEY=
export CALLER_2_PRIVATE_KEY=
export CALLER_3_PRIVATE_KEY=

# call an simple extrinsic as multisig
pnpm call:callSystemRemark

# call an FPass proxy extrinsic as multisig
pnpm call:callProxyExtrinsic

```

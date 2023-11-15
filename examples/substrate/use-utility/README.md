# Utility Pallet

[![Run in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fsubstrate%2Fuse-utility%2FREADME.md&title=Utility%20Pallet%20Examples) [![Pallet Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com/buidl/substrate/pallet-utility)

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/substrate/use-utility

# export all required environments
export CALLER_PRIVATE_KEY=

# use `utility.batch` to dispatch a group of extrinsic
pnpm call:batchExtrinsics

# use `registry.findMetaError` to decode batch error
pnpm call:decodeBatchError

```

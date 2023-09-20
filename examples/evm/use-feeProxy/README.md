# FeeProxy Precompile

[![Run in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fevm%2Fuse-feeProxy%2FREADME.md&title=FeeProxy%20Precompile%20Examples) [![Precompile Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com/buidl/evm/precompile-feeProxy)

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/evm/use-feeProxy

# export all required environments
export CALLER_PRIVATE_KEY=

# `feeProxy.callWithFeePreferences` that wraps around `ERC20.transfer`
pnpm call:callERC20Transfer

```

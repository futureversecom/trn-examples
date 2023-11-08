# FeeProxy Pallet

[![Run in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fsubstrate%2Fuse-feeProxy%2FREADME.md&title=FeeProxy%20Pallet%20Examples) [![Pallet Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com/buidl/substrate/pallet-feeProxy)

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/substrate/use-feeProxy

# export all required environments
export CALLER_PRIVATE_KEY=

# `feeProxy.callWithFeePreferences` that wraps around `system.remarkWithEvent`
pnpm call:callSystemRemark

# `feeProxy.callWithFeePreferences` that wraps around `utility.batchAll`
pnpm call:callBatchAll

# `feeProxy.callWithFeePreferences` that wraps around `evm.call`
pnpm call:callEVMCall

# `feeProxy.callWithFeePreferences` that wraps around `futurepass.proxyExtrinsic`
pnpm call:callProxyExtrinsic

# `feeProxy.callWithFeePreferences` that wraps around `futurepass.proxyExtrinsic` then `emv.call`
pnpm call:callProxyExtrinsicEVMCall

```

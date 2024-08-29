# ERC20 Precompile

[![Run in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fevm%2Fuse-erc20%2FREADME.md&title=ERC-20%20Precompile%20Examples) [![Precompile Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com/buidl/evm/precompile-erc20)

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/evm/xrpl-txs

# export all required environments
export CALLER_PRIVATE_KEY=s**** amount=1 currency=53594C4F00000000000000000000000000000000 destination=rnZiKvrWFGi2JfHtLS8kxcqCqVhch6W5k5 issuer=rPaqStERf9Te6HzbQKrcQW6bhiVRgphZsA trnAddress=0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408

# transfer xrpl token
pnpm call:transfer

```

```bash
export rippleAddress="rPaqStERf9Te6HzbQKrcQW6bhiVRgphZsA"
pnpm call:toTRNAddress
```

```bash
# export all required environments
export CALLER_PRIVATE_KEY=s**** amount=1 currency=524F4F5400000000000000000000000000000000 issuer=rLc3mbdf4mHhH2n6ur6jzgdF8Jb2eZTJFW

# transfer xrpl token
pnpm call:trustline

```

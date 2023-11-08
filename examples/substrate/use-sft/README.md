# SFT (Semi-Fungible Token) Pallet

[![Run in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fsubstrate%2Fuse-sft%2FREADME.md&title=SFT%20Pallet%20Examples) [![Pallet Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com/buidl/substrate/pallet-sft)

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/substrate/use-sft

# export all required environments
export CALLER_PRIVATE_KEY=

# creates new collection
pnpm call:createCollection

# update collection info
pnpm call:updateCollection

# create new token for a collection
pnpm call:createToken

# update token info
pnpm call:updateToken

# mint token(s)
pnpm call:mint

# transfer tokens(s)
pnpm call:transfer

# enable public minting
pnpm call:enablePublicMint

```

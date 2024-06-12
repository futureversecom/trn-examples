# Futurepass Pallet

[![Run in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fsubstrate%2Fuse-futurepass%2FREADME.md&title=Futurepass%20Pallet%20Examples) [![Pallet Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com/buidl/substrate/pallet-futurepass)

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/substrate/use-futurepass-multisig

# export all required environments
export  THRESHOLD=2 WALLET_NAME=test SIGNATORIES=0xFFfFffFF000000000000000000000000000003CD,0x25451A4de12dcCc2D166922fA938E900fCc4ED24,0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408

# creates new multisig wallet and note the wallet address
pnpm call:createMultisigWallet

# export all required environments
export CALLER_PRIVATE_KEY=0xcb6df9de1efca7a3998a8ead4e02159d5fa99c3e0d4fd6432667390bb4726854 // private key of fpass holder
export THRESHOLD=2 SIGNATORIES=0x25451A4de12dcCc2D166922fA938E900fCc4ED24,0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408
# call an extrinsic as FPass account with multisig call (system.remarkWithEvent)
pnpm call:proxyExtrinsic

export CALLER_PRIVATE_KEY=0x79c3b7fc0b7697b9414cb87adcb37317d1cab32818ae18c0e97ad76395d1fdcf // private key of other multisig wallet holder
export THRESHOLD=2 MULTISIG_WALLET=0xe944FAd69B79125706D2481f58b66fcDbED358d7 SIGNATORIES=0x25451A4de12dcCc2D166922fA938E900fCc4ED24,0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408
# sign by second account of multisig wallet
pnpm call:signByOtherWallet

```

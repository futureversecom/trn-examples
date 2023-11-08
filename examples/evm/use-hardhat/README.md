# Using `hardhat deploy`

This project demonstrates a basic smart contract deployment and verification to Porcini using `hardhat deploy` plugin. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

> [!IMPORTANT]
> Ensure the following ENV vars are available before running the examples
>
> - `CALLER_PRIVATE_KEY` - Private key of an account that submits the transaction. Follow this guide to [create and fund an account with some test tokens](../../GUIDES.md) on Porcini (testnet) if you don't have one yet.

## Examples

```bash
# change your working directory to this example first
cd examples/substrate/use-hardhat

# export all required environments
export CALLER_PRIVATE_KEY=

# deploy contract using `hardhat deploy`
pnpm hardhat:deploy

# verify contract using `hardhat sourcify`
pnpm hardhat:verify

```

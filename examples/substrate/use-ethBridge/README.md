# Use ETH Bridge

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Bridge ERC20 tokens from ETH -> TRN

Make a deposit via the `ERC20Peg` Contract on Ethereum... the relayer will relay the tx to The Root Network

```
erc20PegContract.deposit(tokenAddress, amount, destination, {
  value,
  gasLimit,
})
```

Run the command below to execute the example script

```
pnpm call src/bridgeETHToTRN
```

### Bridge ERC20 tokens from TRN -> ETH

Make a withdrawal via the `ERC20Peg` pallet on The Root Network, then claim the tokens on Ethereum

#### Withdrawal Extrinsic

```
api.tx.erc20Peg.withdraw(assetId, amount, destination)
```

#### Claim Transaction

```
bridgeContract.receiveMessage(
  source,
  destination,
  message,
  { eventId, validators, validatorSetId, ...signature },
  {
    value,
    gasLimit,
  }
)
```

Run the command below to execute the example script

```
pnpm call src/bridgeTRNToETH
```

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

Run the command below to execute the example script, optionally passing in an Asset of "ETH" or "SYLO" (defaults to SYLO)

```
pnpm call src/erc20/bridgeETHToTRN --asset=<Asset>
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
pnpm call src/erc20/bridgeTRNToETH
```

### Bridge ERC721 tokens from ETH -> TRN

Make a deposit via the `ERC721Peg` Contract on Ethereum... the relayer will relay the tx to The Root Network

```
erc721PegContract.deposit(tokenAddresses, tokenIds, destination, {
  value,
  gasLimit,
})
```

Run the command below to execute the example script, passing in a Token ID to bridge

```
pnpm call src/erc721/bridgeETHToTRN --tokenId=<Token ID>
```

### Bridge ERC721 tokens from TRN -> ETH

Make a withdrawal via the `NFTPeg` pallet on The Root Network, then claim the tokens on Ethereum

#### Withdrawal Extrinsic

```
api.tx.nftPeg.withdraw(collectionIds, tokenIds, destination)
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

Run the command below to execute the example script, passing in a Token ID to bridge

```
pnpm call src/erc721/bridgeTRNToETH --tokenId=<Token ID>
```

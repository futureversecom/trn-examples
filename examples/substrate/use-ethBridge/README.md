# Use ETH Bridge

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Bridge ERC20 tokens from ETH -> TRN

Make a deposit via the `ERC20Peg` Contract on ETH network... the relayer will relay the tx to The Root Network

```
await erc20PegContract.deposit(tokenAddress, amount, destination, {
	value,
	gasLimit,
})
```

Run the command below to execute the example script

```
pnpm call src/bridgeETHToTRN
```

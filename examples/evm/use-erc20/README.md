# Use ERC20 Precompile

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

## Contract Read/Write

### `totalSupply()`

```js
const XRP_TOKEN_ID = 2;
const { erc20Precompile, wallet } = getERC20PrecompileForAssetId(
	env.CALLER_PRIVATE_KEY,
	XRP_TOKEN_ID
);
const totalSupply = await erc20Precompile.connect(wallet).totalSupply();
```

Run the command below to execute the example script

```shell
pnpm call src/totalSupply.ts

```

### `balanceOf(address who)`

- `who` - address

```js
await erc20Precompile.connect(wallet).balanceOf();
```

Run the command below to execute the example script

```shell
pnpm call src/balanceOf.ts
```

### `allowance(address owner, address spender)`

- `owner` - owner address
- `spender` - spender address

```js
await erc20Precompile
	.connect(wallet)
	.allowance(wallet.address, "0x25451A4de12dcCc2D166922fA938E900fCc4ED24");
```

Run the command below to execute the example script

```shell
pnpm call src/allowance.ts

```

### `transfer(address who, uint256 amount)`

- `who` - Recipient address
- `amount` - Amount to transfer

```js
await erc20Precompile
	.connect(wallet)
	.transfer("0x25451A4de12dcCc2D166922fA938E900fCc4ED24", 1);
```

Run the command below to execute the example script

```
pnpm call src/transferAsset.ts
```

### `approve(address to, uint256 amountToApprove)`

- `to` - Recipient address
- `amount` - Amount to transfer

```js
await erc20Precompile
	.connect(wallet)
	.approve("0x25451A4de12dcCc2D166922fA938E900fCc4ED24", 100);
```

Run the command below to execute the example script

```shell
pnpm call src/setApproval.ts

```

### `transferFrom(address from, address to, uint256 amount)`

- `from` - Sender address
- `to` - Recipient address
- `amount` - Amount to transfer

To use transferFrom we have to make sure approval is set for the recipient address from sender address for the said amount

```js
await erc20Precompile
	.connect(wallet)
	.transferFrom(
		"0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b",
		"0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
		100
	);
```

Run the command below to execute the example script

```shell
export BOB_PRIVATE_KEY=0x000...
pnpm call src/transferFrom.ts

```

## Contract Metadata

### `name()`

```js
await erc20Precompile.connect(wallet).name();
```

### `symbol()`

```js
await erc20Precompile.connect(wallet).symbol();
```

### `decimals()`

```js
await erc20Precompile.connect(wallet).decimals();
```

Run the command below to execute the example script

```shell
pnpm call src/metadata.ts

```

# Use ERC20 precompile

## This uses precompile and solidity smart contract

Get precompile contract for existing asset id.

### TotalSupply of an asset

````
const XRP_TOKEN_ID = 2
const { erc20Precompile, wallet } = getERC20PrecompileForAssetId(env.CALLER_PRIVATE_KEY, XRP_TOKEN_ID);```
const totalSupply = await erc20Precompile.connect(wallet).totalSupply();

````

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/totalSupply.ts

```

### BalanceOf an address

Using the `balanceOf(address who)` function from ERC20

- `who` - address

```

const balance = await erc20Precompile.connect(wallet).balanceOf();

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/balanceOf.ts

```

### Allowance of an address

Using the `allowance(address owner, address spender)` function from ERC20

- `owner` - owner address
- `spender` - spender address

```

const allowance = await erc20Precompile.connect(wallet).allowance(wallet.address, '0x25451A4de12dcCc2D166922fA938E900fCc4ED24');

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/allowance.ts

```

### Transfer Asset

Using the `transfer(address who, uint256 amount)` function from ERC20

- `who` - Recipient address
- `amount` - Amount to transfer

```

erc20Precompile.connect(wallet).transfer("0x25451A4de12dcCc2D166922fA938E900fCc4ED24", 1);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/transferAsset.ts

```

### SetApproval

Using the `approve(address to, uint256 amountToApprove)` function from ERC20

- `to` - Recipient address
- `amount` - Amount to transfer

```

erc20Precompile.connect(wallet).approve(0x25451A4de12dcCc2D166922fA938E900fCc4ED24", 100);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/setApproval.ts

```

### TransferFrom Asset

Using the `transferFrom(address from, address to, uint256 amount)` function from ERC20

- `from` - Sender address
- `to` - Recipient address
- `amount` - Amount to transfer

To use transferFrom we have to make sure approval is set for the recipient address from sender address for the said amount

```

erc20Precompile.connect(wallet).transferFrom("0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b","0x25451A4de12dcCc2D166922fA938E900fCc4ED24", 100);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY` and `BOB_PRIVATE_KEY`

```

BOB_PRIVATE_KEY=0x000 CALLER_PRIVATE_KEY=0x000... pnpm call src/transferFrom.ts

```

## Asset Metadata

### Name

Using the `name()` function from ERC20

```

const name = await erc20Precompile.connect(wallet).name();

```

### Symbol

Using the `symbol()` function from ERC20

```

const symbol = await erc20Precompile.connect(wallet).symbol();

```

### Decimals

Using the `symbol()` function from ERC20

```

const symbol = await erc20Precompile.connect(wallet).decimals();

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/metadata.ts

```

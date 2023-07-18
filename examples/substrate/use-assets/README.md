# Use FuturePass

### Transfer Asset

Using the `assets.transfer(assetId, target, amount)` extrinsic

- `assetId` - Asset ID to transfer
- `target` - Recipient address
- `amount` - Amount to transfer

```
const ASTO = {
  id: 17508,
  decimals: 18,
};
api.tx.assets.transfer(ASTO.id, "0x25451A4de12dcCc2D166922fA938E900fCc4ED24", 1 * 10 ** ASTO.decimals);
```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```
CALLER_PRIVATE_KEY=0x000... pnpm call src/transferAsset.ts
```

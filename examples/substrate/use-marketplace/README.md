# Use Marketplace

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Register Marketplace

Using the `marketplace.registerMarketplace(marketplaceAccount, entitlement)` extrinsic

- `marketplaceAccount` - If specified, this account will be registered, otherwise the caller will be registered
- `entitlement` - Permill, percentage of sales to go to the marketplace

```
api.tx.marketplace.registerMarketplace(
    null,
    10_000,
);
```

Run the command below to execute the example script

```
pnpm call src/registerMarketplace.ts
```

# Use Dex

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Swap

Using the `dex.swap(amountIn, amountOutMin, path, to, deadline)` extrinsic

- `amountIn` - Exact supply amount
- `amountOutMin` - Acceptable minimum target amount
- `path` - Trading path
- `to` - The recipient of the swapped token asset. The caller is the default recipient if it is set to None
- `deadline` - The deadline of executing this extrinsic. The deadline won't be checked if it is set to None

```
api.tx.dex.swap(1_000_000, 500_000, [1, 2], null, null);
```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```
pnpm call src/swap.ts
```

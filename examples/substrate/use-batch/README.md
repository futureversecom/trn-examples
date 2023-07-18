# Use Batch

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Batch Extrinsics

Using the `utility.batch(calls)` extrinsic

- `calls` - Array of calls (extrinsics) to be batched

```
api.tx.utility.batch([
  api.tx.system.remark("Hello world"),
  api.tx.system.remark("Goodbye world")
]));
```

Run the command below to execute the example script

```
pnpm call src/batchExtrinsics.ts
```

### Decoding Batch Error

Using the `api.registry.findMetaError({index, error})` utility

```
import { BN, hexToU8a } from "@polkadot/util";

const { section, name, docs } = api.registry.findMetaError({
  index: new BN(index),
  error: hexToU8a(error),
});
```

Run the command below to execute the example script

```
pnpm call src/decodeBatchError.ts
```

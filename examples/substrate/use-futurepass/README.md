# Use FuturePass

First Run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Create FPassAccount

Using the `futurepass.create(account)` extrinsic

- `account` - Owner of the newly created FuturePass account

```
api.tx.futurepass.create("0x25451A4de12dcCc2D166922fA938E900fCc4ED24");
```

Run the command below to execute the example script

```
pnpm call src/createFuturepassAccount.ts
```

### Register a Delegate

### De-register a Delegate

### Proxy Extrinsic

Using the `futurepass.proxyExtrinsic(futurepass, call)` extrinsic

- `futurepass` - The FuturePass account though which the call is dispatched
- `call` - The call that needs to be dispatched through the FuturePass account

Run the command below to execute the example script

```
api.tx.futurepass.proxyExtrinsic("0xFfFfFfff...", api.tx.system.remark("Hello World"));
```

```
pnpm call src/proxyExtrinsic.ts
```

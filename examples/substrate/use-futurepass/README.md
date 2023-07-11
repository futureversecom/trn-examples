# Use Futurepass

First run

```
export CALLER_PRIVATE_KEY=0x000...
export DELEGATE_PRIVATE_KEY=0x000...
```

### Create Futurepass account

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

Using the `futurepass.registerDelegateWithSignature(futurepass, delegate, proxyType, deadline, signature)` extrinsic

- `futurepass` - Futurepass account to register the account as delegate
- `delegate` - The delegated account for the futurepass
- `proxyType` - Delegate permission level
- `deadline` - Deadline for the signature
- `signature` - Signature of the message parameters

```
api.tx.futurepass.registerDelegateWithSignature(
    "0xfFfFfFFF0000000000000000000000000000001F",
    "0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
    1,
    10_000,
    "0x2324u..."
);
```

Run the command below to execute the example script

```
pnpm call src/registerDelegate.ts
```

### Unregister a Delegate

Using the `futurepass.unregisterDelegate(futurepass, delegate)` extrinsic

- `futurepass` - Futurepass account to unregister the delegate from
- `delegate` - The delegated account for the futurepass

```
api.tx.futurepass.unregisterDelegate(
    "0xfFfFfFFF0000000000000000000000000000001F",
    "0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
);
```

Run the command below to execute the example script

```
pnpm call src/unregisterDelegate.ts
```

### Proxy Extrinsic

Using the `futurepass.proxyExtrinsic(futurepass, call)` extrinsic

- `futurepass` - The FuturePass account though which the call is dispatched
- `call` - The call that needs to be dispatched through the FuturePass account

```
api.tx.futurepass.proxyExtrinsic("0xFfFfFfff...", api.tx.system.remark("Hello World"));
```

Run the command below to execute the example script

```
pnpm call src/proxyExtrinsic.ts
```

### Decode Proxy Error

Run the command below to execute the example script

```
pnpm call src/decodeProxyError.ts
```

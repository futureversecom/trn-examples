# Use FeeProxy

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Call with Fee Preferences

Using the `feeProxy.callWithFeePreferences(paymentAsset, maxPayment, call)` extrinsic

- `paymentAsset` - The token to be used for paying gas fees
- `maxPayment` - The limit of how many tokens will be used to perform the exchange
- `call` - The inner call to be performed after the exchange

```
api.tx.feeProxy.callWithFeePreferences(1, 3_000_000, api.tx.system.remark("Hello World"));
```

Run the command below to execute the example script, passing in a Payment Asset ID

```
pnpm call src/callWithFeePreferences.ts --paymentAsset=<Payment Asset ID>
```


### Call with Fee Preferences and proxy extrinsic
Using the `feeProxy.callWithFeePreferences(paymentAsset, maxPayment, proxyExtrinsic)` extrinsic

- `paymentAsset` - The token to be used for paying gas fees
- `maxPayment` - The limit of how many tokens will be used to perform the exchange
- `proxyExtrinsic` - The inner call to be performed after the exchange. Here proxy extrinsic is fpass proxy call
- 
```const proxyExtrinsic = api.tx.futurepass.proxyExtrinsic(futurepassAddress, innerCall);```

```
api.tx.feeProxy.callWithFeePreferences(1, 3_000_000, api.tx.system.remark("Hello World"));
```

Run the command below to execute the example script, passing in a Payment Asset ID

```
pnpm call src/callWithFeePreferences.ts --paymentAsset=<Payment Asset ID>
```

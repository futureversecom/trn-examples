# FeeProxy Pallet

[![Open in StackBlitz](https://img.shields.io/badge/Open_in_StackBlitz-1269D3?style=for-the-badge&logo=stackblitz&logoColor=white)](https://stackblitz.com/github/futureversecom/trn-examples?file=examples%2Fsubstrate%2Fuse-feeProxy%2FREADME.md&title=FeeProxy%20Pallet%20Examples) [![Pallet Documentation](https://img.shields.io/badge/Pallet_Documentation-black?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs-beta.therootnetwork.com)

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
- `const proxyExtrinsic = api.tx.futurepass.proxyExtrinsic(futurepassAddress, innerCall);`

```
api.tx.feeProxy.callWithFeePreferences(1, 3_000_000, api.tx.system.remark("Hello World"));
```

Run the command below to execute the example script, passing in a Payment Asset ID

```
pnpm call src/callWithFeePreferences.ts --paymentAsset=<Payment Asset ID>
```

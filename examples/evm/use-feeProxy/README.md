# Use FeeProxy

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

## Contract Read/Write

Specify the payment asset id to get paymentPrecompileAddress

```js
const { erc20Precompile, wallet } = getERC20PrecompileForAssetId(
	env.CALLER_PRIVATE_KEY,
	paymentAsset
);
const feeToken = erc20Precompile;
```

Create FeeToken contract

```
const feeProxy = new Contract(FEE_PROXY_ADDRESS, FEE_PROXY_ABI, wallet);
```

### `callWithFeePreferences(address asset, uint128 maxPayment, address target, bytes input)`

- `asset` - precompile address for payment asset
- `maxPayment` - max payment user is willing to be pay in payment asset
- `target` - precompile address for payment asset
- `input` - transaction for which fee is to be paid in payment asset

```js
const unsignedTx = {
	type: 0,
	from: wallet.address,
	to: FEE_PROXY_ADDRESS,
	nonce: nonce,
	data: feeProxy.interface.encodeFunctionData("callWithFeePreferences", [
		feeToken.address,
		maxFeePaymentInToken,
		feeToken.address,
		transferInput,
	]),
	gasLimit: gasEstimate,
	gasPrice: fees.gasPrice,
};

await wallet.signTransaction(unsignedTx);
const tx = await wallet.sendTransaction(unsignedTx);
```

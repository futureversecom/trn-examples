# Use XRPL bridge

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Bridge XRP tokens from XRPL -> TRN

Using the `xrpl client` deposit (send payment) to DOOR account with memodata field, once the tx is received by DOOR account.. the relayer will relay the tx to the root network

```
const request: Payment = {
    TransactionType: "Payment",
    Destination: XRP_BRIDGE_ADDRESS,
    Account: wallet.address,
    Amount: xrpToDrops(amount),
    Memos: [
      {
        Memo: {
          MemoType: convertStringToHex("Address"),
          MemoData: convertStringToHex(receiver),
        },
      },
    ],
  };
  const response = await xrplApi.submit(request, { wallet: wallet });
```

Run the command below to execute the example script

```
pnpm call src/bridgeXRPLToTRN
```

### Bridge XRP tokens from TRN -> XRPL

Using the `xrplBridge.withdrawXrp(amount, recipientAddress)` extrinsic

- `amount` - Amount received on xrpl chain
- `recipientAddress` - Classic address on xrp where amount is received (convert to ethereum address)

```
api.tx.xrplBridge.withdrawXrp(
    10_000,
    "0x3E9D4A2B8AA0780F682D..."
);
```

Run the command below to execute the example script

```
pnpm call src/bridgeTRNToXRPL
```

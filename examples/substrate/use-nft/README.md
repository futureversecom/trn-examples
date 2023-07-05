# Use NFT Pallet

### [Mint Tokens](./src/mintTokens)

Input:

```
export CALLER_PRIVATE_KEY=
export NFT_COLLECTION_ID=

pnpm call src/mintTokens.ts
```

Output:

```
Extrinsic Result {
  phase: { applyExtrinsic: 1 },
  event: {
    index: '0x1101',
    data: [ 91236, 20, 29, '0x25451A4de12dcCc2D166922fA938E900fCc4ED24' ]
  },
  topics: []
}
```

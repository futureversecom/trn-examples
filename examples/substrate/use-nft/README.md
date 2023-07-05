# Use NFT

### Create Collection

Using the `nft.createCollection(name, initialIssuance, maxIssuance, tokenOwner, metadataScheme, royaltiesSchedule, crossChainCompatibility)` extrinsic

- `name` - The name of the collection
- `initialIssuance` - Number of tokens to mint now
- `maxIssuance` - Maximum number of tokens allowed in collection
- `tokenOwner` - The token owner, defaults to the caller
- `metadataScheme` - The off-chain metadata referencing scheme for tokens in this
- `royaltiesSchedule` - Defacto royalties plan for secondary sales, this will

```
api.tx.nft.createCollection(
    "MyCollection",
    1_000,
    null,
    null,
    "0x8324...",
    null,
    false
);
```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```
CALLER_PRIVATE_KEY=0x000... pnpm call src/createCollection.ts
```

### Mint NFT

Using the `nft.mint(collectionId, quantity, tokenOwner)` extrinsic

- `collectionId` - The ID of the collection
- `quantity` - Number of tokens to mintnow
- `tokenOwner` - The token owner, defaults to the caller

```
api.tx.nft.mint(
    97380,
    10,
    "0x8324...",
);
```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY` and passed in a Collection ID

```
CALLER_PRIVATE_KEY=0x000... pnpm call src/mintNft.ts --collectionId=<Collection ID>
```

### Transfer NFT

Using the `nft.transfer(collectionId, serialNumbers, newOwner)` extrinsic

- `collectionId` - The ID of the collection
- `serialNumbers` - Array of token IDs to transfer
- `newOwner` - The new token owner

```
api.tx.nft.mint(
    97380,
    [1, 2, 3],
    "0x8324...",
);
```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY` and passed in a Collection ID

```
CALLER_PRIVATE_KEY=0x000... pnpm call src/transferNft.ts --collectionId=<Collection ID>
```

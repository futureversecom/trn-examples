# Use SFT

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Create Collection

Using the `sft.createCollection(collectionName, collectionOwner, metadataScheme, royaltiesSchedule)` extrinsic

- `collectionName` - The name of the collection
- `collectionOwner` - The collection owner, defaults to the caller
- `metadataScheme` - The off-chain metadata referencing scheme for tokens in this collection
- `royaltiesSchedule` - Defacto royalties plan for secondary sales, this will apply to all tokens in the collection by default

```
api.tx.sft.createCollection(
    "MyCollection",
    null,
    "0x8324...",
    null,
);
```

Run the command below to execute the example script

```
pnpm call src/createCollection.ts
```

### Create Token

Using the `sft.createToken(collectionId, tokenName, initialIssuance, maxIssuance, tokenOwner)` extrinsic

- `tokenName` - The name of the collection
- `initialIssuance` - Number of tokens to mint now
- `maxIssuance` - Maximum number of tokens allowed in collection
- `tokenOwner` - The token owner, defaults to the caller

```
api.tx.sft.createToken(
    "MyToken",
    0,
    100,
    "0x8324...",
);
```

Run the command below to execute the example script, passing in a Collection ID

```
pnpm call src/createToken.ts --collectionId=<Collection ID>
```

### Mint SFT

Using the `sft.mint(collectionId, quantity, tokenOwner)` extrinsic

- `collectionId` - The SFT collection to mint into
- `serialNumbers` - A list of serial numbers/quantities to mint
- `tokenOwner` - The owner of the tokens, defaults to the caller

```
api.tx.sft.mint(
    97380,
    [[101476, 10]],
    "0x8324...",
);
```

Run the command below to execute the example script, passing in a Collection ID and Token ID

```
pnpm call src/mintNft.ts --collectionId=<Collection ID> --tokenId=<Token ID>
```

### Transfer SFT

Using the `sft.transfer(collectionId, serialNumbers, newOwner)` extrinsic

- `collectionId` - The ID of the collection
- `serialNumbers` - A list of serial numbers/quantities to mint
- `newOwner` - The new owner of the tokens

```
api.tx.sft.mint(
    97380,
    [[101476, 2]],
    "0x8324...",
);
```

Run the command below to execute the example script, passing in a Collection ID and Token ID

```
pnpm call src/transferNft.ts --collectionId=<Collection ID> --tokenId=<Token ID>
```

## Set SFT BaseURI

Using the `sft.setBaseUri(collectionId, metadataScheme)` extrinsic

- `collectionId` - The ID of the collection
- `metadataScheme` - Hex of the new BaseURI

```
api.tx.sft.setBaseUri(
    97380,
    "0x8324...",
);
```

Run the command below to execute the example script passing in a Collection ID

```
pnpm call src/setBaseUri.ts --collectionId=<Collection ID>
```

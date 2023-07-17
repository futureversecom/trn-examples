# Use Marketplace

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

### Register Marketplace

Using the `marketplace.registerMarketplace(marketplaceAccount, entitlement)` extrinsic

- `marketplaceAccount` - If specified, this account will be registered, otherwise the caller will be registered
- `entitlement` - Permill, percentage of sales to go to the marketplace

```
api.tx.marketplace.registerMarketplace(
    null,
    10_000,
);
```

Run the command below to execute the example script

```
pnpm call src/registerMarketplace.ts
```

### Auction NFT

Using the `marketplace.auctionNft(collectionId, serialNumbers, paymentAsset, reservePrice, duration, marketplaceId)` extrinsic

- `collectionId` - The ID of the collection
- `serialNumbers` - Array of token IDs to transfer
- `paymentAsset` - Fungible Asset ID to receive payment with
- `reservePrice` - Winning bid must be over this threshold
- `duration` - Length of the auction (in blocks), uses default duration if unspecified
- `marketplaceId` - The ID of the marketplace

```
api.tx.marketplace.auctionNft(
    100,
    [1, 2, 3],
    1,
    100_000,
    100,
    2
);
```

Run the command below to execute the example script, passing in a Collection ID & Serial Numbers

```
pnpm call src/auctionNft.ts --collectionId=<CollectionID> --serialNumbers=<Serial Numbers>
```

### Sell NFT

Using the `marketplace.sellNft(collectionId, serialNumbers, buyer, paymentAsset, fixedPrice, duration, marketplaceId)` extrinsic

- `collectionId` - The ID of the collection
- `serialNumbers` - Array of token IDs to transfer
- `buyer` - Optionally, the account to receive the NFT. If unspecified, then any account may purchase
- `paymentAsset` - Fungible Asset ID to receive payment with
- `fixedPrice` - Ask price
- `duration` - Length of the auction (in blocks), uses default duration if unspecified
- `marketplaceId` - The ID of the marketplace

```
api.tx.marketplace.auctionNft(
    100,
    [1, 2, 3],
    null,
    1,
    100_000,
    100,
    2
);
```

Run the command below to execute the example script

```
pnpm call src/sellNft.ts
```

### Buy NFT

Using the `marketplace.buy(listingId)` extrinsic

- `listingId` - The ID of the listing

```
api.tx.marketplace.buy(
    4
);
```

Run the command below to execute the example script, passing in a Listing ID

```
pnpm call src/buyNft.ts --listingId=<Listing ID>
```

### Make Simple Offer

Using the `marketplace.makeSimpleOffer(tokenId, amount, assetId, marketplaceId)` extrinsic

- `tokenId` - The ID of the token
- `amount` - Offer price
- `assetId` - Fungible Asset ID to make payment with
- `marketplaceId` - The ID of the marketplace

```
api.tx.marketplace.auctionNft(
    12,
    10_000,
    1,
    2
);
```

Run the command below to execute the example script, passing in a Token & Marketplace ID

```
pnpm call src/simpleOffer.ts --tokenId=<Token ID> --marketplaceId=<Marketplace ID>
```

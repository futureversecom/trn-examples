# Use ERC721 Precompile

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

## Contract Read/Write

### Create Collection

Using the `nft.createCollection(name, initialIssuance, maxIssuance, tokenOwner, metadataScheme, royaltiesSchedule, crossChainCompatibility)` extrinsic

- `name` - The name of the collection
- `initialIssuance` - Number of tokens to mint now
- `maxIssuance` - Maximum number of tokens allowed in collection
- `tokenOwner` - The token owner, defaults to the caller
- `metadataScheme` - The off-chain metadata referencing scheme for tokens in this
- `royaltiesSchedule` - Defacto royalties plan for secondary sales, this will

```js
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

Refer to [this](https://github.com/futureversecom/trn-examples/blob/main/examples/substrate/use-nft/src/createCollection.ts) example.

On executing the above extrinsic, it will create a collection id.
Get precompile contract for this collection id.

Collection can also be created using precompiles

```js
    const { nftPrecompile, wallet } = getNFTPrecompile(env.CALLER_PRIVATE_KEY)
    const maxIssuance = BigNumber.from(0);
    const metadataPath = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("https://example.com/metadata/"));
    const name = 'test';
    const royaltyAddresses = [wallet.address];
    const royaltyEntitlements = [1000];
    // new collection with unlimited mintable supply
    const tx = await nftPrecompile.connect(wallet).initializeCollection(
        wallet.address,
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(name)),
        maxIssuance,
        metadataPath,
        royaltyAddresses,
        royaltyEntitlements,
    );
    const receipt = await tx.wait();
    const erc721PrecompileAddress = (receipt?.events as any)[0].args.precompileAddress;
```

```js
const { erc721Precompile, wallet } = getERC721Precompile(
  env.CALLER_PRIVATE_KEY,
  COLLECTION_ID
);
```

### `mint(address owner, uint32 quantity)`

- `owner` - address of the owner who mints
- `quantity` - number of tokens to mint

```js
await erc721Precompile.connect(wallet).mint(wallet.address, 100);
```

Run the command below to execute the example script

```shell
pnpm call src/mint.ts
```

### `balanceOf(address who)`

- `who` - address

```js
await erc721Precompile.connect(wallet).balanceOf(wallet.address);
```

Run the command below to execute the example script

```shell
pnpm call src/balanceOf.ts
```

### `tokenURI(uint256 tokenId)`

- `tokenId` - tokenId/serial number

```js
const tokenId = 4;
await erc721Precompile.connect(wallet).tokenURI(tokenId);
```

Run the command below to execute the example script

```shell
pnpm call src/tokenURI.ts

```

### `ownerOf(uint256 tokenId)`

- `tokenId` - tokenId/serial number

```js
const tokenId = 4;
await erc721Precompile.connect(wallet).ownerOf(tokenId);
```

Run the command below to execute the example script

```shell
pnpm call src/ownerOf.ts

```

### `getApproved(uint256 tokenId)`

- `tokenId` - serial number

```js
const serialNumber = 12;
await erc721Precompile.connect(wallet).getApproved(serialNumber);
```

Run the command below to execute the example script

```shell
pnpm call src/getApproved.ts

```

### `isApprovedForAll(address owner, address operator)`

- `owner` - original owner
- `operator` - approved for owner

```js
const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
const address = await erc721Precompile
  .connect(wallet)
  .isApprovedForAll(wallet.address, bob);
```

Run the command below to execute the example script

```shell
pnpm call src/isApprovedForAll.ts

```

### `approve(address to, uint256 tokenId)`

- `to` - Recipient address
- `tokenId` - tokenId/serial number to approve

```js
const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
const tokenId = 12;
await erc721Precompile.connect(wallet).approve(bob, tokenId);
```

Run the command below to execute the example script

```shell
pnpm call src/setApproval.ts

```

### `transferFrom(address from, address to, uint256 tokenId)`

- `from` - Sender address
- `to` - Recipient address
- `tokenId` - tokenId/serial number approved

To use transferFrom we have to make sure approval is set for the recipient address from sender address for the said tokenId

```js
erc721Precompile
  .connect(wallet)
  .transferFrom(
    "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b",
    "0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
    100
  );
```

Run the command below to execute the example script

```shell
export BOB_PRIVATE_KEY=0x000...
pnpm call src/transferFrom.ts

```

## Asset Metadata

### `name()`

```js
await erc721Precompile.connect(wallet).name();
```

### `symbol()`

```js
await erc721Precompile.connect(wallet).symbol();
```

Run the command below to execute the example script

```shell
pnpm call src/metadata.ts
```

### `transferOwnership(address newOwner)`

- `newOwner` - newOwner of the collection

```js
await erc721Precompile
  .connect(wallet)
  .transferOwnership("0x25451A4de12dcCc2D166922fA938E900fCc4ED24");
```

Run the command below to execute the example script

```shell
pnpm call src/transferOwnership.ts

```

### `revokeOwnership()`

```js
await erc721Precompile.connect(wallet).revokeOwnership();
```

Run the command below to execute the example script

```shell
pnpm call src/revokeOwnership.ts

```

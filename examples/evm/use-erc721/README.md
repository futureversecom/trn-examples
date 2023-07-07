# Use ERC721 precompile

## This uses precompile

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

Refer to [this](https://github.com/futureversecom/trn-examples/blob/main/examples/substrate/use-nft/src/createCollection.ts) example.

On executing the above extrinsic, it will create a collection id.
Get precompile contract for this collection id.

In all the examples, we would be using the collection id (105572) created at [blockhash](https://portal.rootnet.cloud/?rpc=wss%3A%2F%2Fporcini.rootnet.app%2Farchive%2Fws#/explorer/query/0xf585b34a3e1b286058be39829bff1359b2934fba2b2fbf4fa5ec0d85789d4e93)

```
const { erc721Precompile, wallet } = getERC721Precompile(
        env.CALLER_PRIVATE_KEY,
        COLLECTION_ID
    );

```

### Mint nfts

Using the `mint(address owner, uint32 quantity)` function from ERC721

- `owner` - address of the owner who mints
- `quantity` - number of tokens to mint

```
ERC721Precompile.connect(wallet).mint(wallet.address, 100);
```

Run the command below to execute the example script, ensure you have specified a valid
`CALLER_PRIVATE_KEY`

```
CALLER_PRIVATE_KEY=0x000... pnpm call src/mint.ts
```

### BalanceOf address

Using the `balanceOf(address who)` function from ERC721

- `who` - address

```

const balance = await erc721Precompile.connect(wallet).balanceOf(wallet.address);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/balanceOf.ts

```

### TokenURI a tokenId

Using the `tokenURI(uint256 tokenId)` function from ERC721

- `tokenId` - tokenId/serial number

```
const tokenId = 4;
const tokenURI = await erc721Precompile.connect(wallet).tokenURI(tokenId);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/tokenURI.ts

```

### OwnerOf a tokenId

Using the `ownerOf(uint256 tokenId)` function from ERC721

- `tokenId` - tokenId/serial number

```
const tokenId = 4;
const ownerAddress = await erc721Precompile.connect(wallet).ownerOf(tokenId);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/ownerOf.ts

```

### Approved address

Using the `getApproved(uint256 tokenId)` function from ERC721

- `tokenId` - serial number

```
const serialNumber = 12;
const address = await ERC721Precompile.connect(wallet).getApproved(serialNumber);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/getApproved.ts

```

### IsApprovedForAll

Using the `isApprovedForAll(address owner, address operator)` function from ERC721

- `owner` - original owner
- `operator` - approved for owner

```
const bob = '0x25451A4de12dcCc2D166922fA938E900fCc4ED24';
const address = await ERC721Precompile.connect(wallet).isApprovedForAll(wallet.address, bob);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/isApprovedForAll.ts

```

### SetApproval

Using the `approve(address to, uint256 tokenId)` function from ERC721

- `to` - Recipient address
- `tokenId` - tokenId/serial number to approve

```
const bob = '0x25451A4de12dcCc2D166922fA938E900fCc4ED24';
const tokenId = 12;
ERC721Precompile.connect(wallet).approve(bob, tokenId);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/setApproval.ts

```

### TransferFrom tokenId

Using the `transferFrom(address from, address to, uint256 tokenId)` function from ERC721

- `from` - Sender address
- `to` - Recipient address
- `tokenId` - tokenId/serial number approved

To use transferFrom we have to make sure approval is set for the recipient address from sender address for the said tokenId

```

ERC721Precompile.connect(wallet).transferFrom("0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b","0x25451A4de12dcCc2D166922fA938E900fCc4ED24", 100);

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY` and `BOB_PRIVATE_KEY`

```

BOB_PRIVATE_KEY=0x000 CALLER_PRIVATE_KEY=0x000... pnpm call src/transferFrom.ts

```

## Asset Metadata

### Name

Using the `name()` function from ERC721

```

const name = await ERC721Precompile.connect(wallet).name();

```

### Symbol

Using the `symbol()` function from ERC721

```
const symbol = await ERC721Precompile.connect(wallet).symbol();
```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```
CALLER_PRIVATE_KEY=0x000... pnpm call src/metadata.ts
```

### TransferOwnership of the Collection/NFT

Using the `transferOwnership(address newOwner)` function from Ownable

- `newOwner` - newOwner of the colleciton

```

ERC721Precompile.connect(wallet).transferOwnership("0x25451A4de12dcCc2D166922fA938E900fCc4ED24");

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/transferOwnership.ts

```

### RevokeOwnership of the Collection/NFT

Using the `revokeOwnership()` function from Ownable

```

ERC721Precompile.connect(wallet).revokeOwnership();

```

Run the command below to execute the example script, ensure you have specified a valid `CALLER_PRIVATE_KEY`

```

CALLER_PRIVATE_KEY=0x000... pnpm call src/revokeOwnership.ts

```

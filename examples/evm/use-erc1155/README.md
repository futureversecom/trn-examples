# Use ERC1155 Precompile

First run

```
export CALLER_PRIVATE_KEY=0x000...
```

## Contract Read/Write

### Create erc1155 NFT or SFT Collection

Refer to [this](https://github.com/futureversecom/trn-examples/blob/main/examples/substrate/use-sft/src/createCollection.ts) example.

On executing the above extrinsic, it will create a collection id.
Get precompile contract for this collection id.

Collection can also be created using precompiles

```js

const { sftPrecompile, wallet } = getSFTPrecompile(env.CALLER_PRIVATE_KEY);

const owner = wallet.address;
const name = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Collection"));
const metadataPath = ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes("https://example.com/sft/metadata")
);
const royaltyAddresses = [wallet.address];
const royaltyEntitlements = [1000];

const initializeTx = await sftPrecompile
    .connect(wallet)
    .initializeCollection(
        owner,
        name,
        metadataPath,
        royaltyAddresses,
        royaltyEntitlements
    );
const receipt = await initializeTx.wait();
    const {nftPrecompile, wallet} = getSFTPrecompile(env.CALLER_PRIVATE_KEY)
// The precompile address of transaction
const { precompileAddress } = (receipt?.events as any)[0]
    .args;

```

Either specify the collection id or precompile address to get erc1155Precompile

```js
const { erc1155Precompile, wallet } = getERC1155Precompile(
  env.CALLER_PRIVATE_KEY,
  precompileAddress,
  COLLECTION_ID
);
```

### `mint(address owner, uint256 id, uint256 amount)`

- `owner` - address of the owner who mints
- `id` - serial number
- `amount` - number of tokens of serial number to mint

```js
const tokenName = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyToken"));
const maxIssuance = 0;
const initialIssuance = 100;
const tx = await erc1155Precompile
    .connect(wallet)
    .createToken(tokenName, initialIssuance, maxIssuance, wallet.address);
const receipt = await tx.wait();
const serialNumber = (receipt?.events as any)[0].args.serialNumber;
const quantity = 105;
//
await erc1155Precompile
    .connect(wallet)
    .mint(wallet.address, serialNumber, quantity);
await erc1155Precompile.connect(wallet).mint(wallet.address, serialNumber, 100);
```

Run the command below to execute the example script

```shell
pnpm call src/mint.ts
```

### `mintBatch(address owner, uint256[] ids, uint256[] amounts)`

- `owner` - address of the owner who mints
- `ids` - serial numbers
- `amounts` - array of amount of serial numbers to mint

```js
await erc1155Precompile
  .connect(wallet)
  .mintBatch(
    receiverAddress,
    [serialNumber1, serialNumber2],
    [initialIssuance1, initialIssuance2]
  );
```

Run the command below to execute the example script

```shell
pnpm call src/mintBatch.ts
```

### `burn(address owner, uint256 id, uint256 value)`

- `owner` - address of the owner who mints
- `id` - serial number
- `burnAmount` - amount of serial numbers to burn

```js
await erc1155Precompile
  .connect(wallet)
  .burn(wallet.address, serialNumber, burnAmount);
```

Run the command below to execute the example script

```shell
pnpm call src/burn.ts
```

### `burnBatch(address owner, uint256[] ids, uint256[] amounts)`

- `owner` - address of the owner who mints
- `ids` - serial numbers
- `amounts` - array of amount of serial numbers to burn

```js
await erc1155Precompile
  .connect(wallet)
  .burnBatch(
    ownerAddress,
    [serialNumber1, serialNumber2],
    [burnAmount1, burnAmount2]
  );
```

Run the command below to execute the example script

```shell
pnpm call src/burnBatch.ts
```

### `balanceOf(address owner, uint256 id)`

- `owner` - address
- `id` - serial number

```js
await erc1155Precompile.connect(wallet).balanceOf(wallet.address, serialNumber);
```

Run the command below to execute the example script

```shell
pnpm call src/balanceOf.ts
```

### `balanceOfBatch(address[] owners, uint256[] ids)`

- `owner[]` - array of address
- `ids` - array of serial number

```js
await erc1155Precompile
  .connect(wallet)
  .balanceOf(["0x00..", "0x00.."], [serialNumber1, serialNumber2]);
```

Run the command below to execute the example script

```shell
pnpm call src/balanceOfBatch.ts
```

### `tokenURI(uint256 id)`

- `id` - serial number

```js
const serialNumber = 4;
const tokenUri = await erc1155Precompile.uri(serialNumber);
```

Run the command below to execute the example script

```shell
pnpm call src/tokenURI.ts

```

### `owner()`

```js
const collectionOwner = await erc1155Precompile.connect(wallet).owner();
```

Run the command below to execute the example script

```shell
pnpm call src/owner.ts
```

### `totalSupply(uint256 id)`

- `id` - serial number

```js
const collectionOwner = await erc1155Precompile
  .connect(wallet)
  .totalSupply(serialNumber);
```

Run the command below to execute the example script

```shell
pnpm call src/totalSupply.ts
```

### `isApprovedForAll(address account, address operator)`

- `account` - original owner
- `operator` - approved for owner

```js
const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
const address = await erc1155Precompile
  .connect(wallet)
  .isApprovedForAll(wallet.address, bob);
```

Run the command below to execute the example script

```shell
pnpm call src/isApprovedForAll.ts

```

### `setApprovalForAll(address operator, bool approved)`

- `operator` - Recipient address
- `approved` - boolean (true/false)

```js
const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
await erc1155Precompile.connect(wallet).setApprovalForAll(bob, true);
```

Run the command below to execute the example script

```shell
pnpm call src/setApproval.ts

```

### `safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)`

- `from` - Sender address
- `to` - Recipient address
- `id` - serial number to approve
- `amount` - amount to approve
- `data` - any message data

To use safetransferFrom we have to make sure approval is set for the recipient address from sender address for the said tokenId

```js
erc1155Precompile
  .connect(toSignerWallet)
  .transferFrom(
    from,
    to,
    serialNumber,
    100,
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes("data"))
  );
```

Run the command below to execute the example script

```shell
export BOB_PRIVATE_KEY=0x000...
pnpm call src/safetransferFrom.ts

```

### `safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)` when sender is owner

- `from` - Sender address
- `to` - Recipient address
- `id` - serial number to approve
- `amount` - amount to approve
- `data` - any message data

```js
erc1155Precompile
  .connect(fromSignerWallet)
  .transferFrom(
    from,
    to,
    serialNumber,
    100,
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes("data"))
  );
```

Run the command below to execute the example script

```shell
export BOB_PRIVATE_KEY=0x000...
pnpm call src/safetransferFromOwner.ts

```

### `safeBatchTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)`

- `from` - Sender address
- `to` - Recipient address
- `ids` - array of serial number to approve
- `amounts` - array of amount to approve
- `data` - any message data

```js
const tx = await erc1155Precompile.safeBatchTransferFrom(
  wallet.address,
  bobSigner.address,
  [serialNumber1, serialNumber2],
  [transferAmount1, transferAmount2],
  callData
);
```

Run the command below to execute the example script

```shell
export BOB_PRIVATE_KEY=0x000...
pnpm call src/safeBatchTransferFrom.ts

```

### `transferOwnership(address newOwner)`

- `newOwner` - newOwner of the collection

```js
await erc1155Precompile
  .connect(wallet)
  .transferOwnership("0x25451A4de12dcCc2D166922fA938E900fCc4ED24");
```

Run the command below to execute the example script

```shell
pnpm call src/transferOwnership.ts

```

### `revokeOwnership()`

```js
await erc1155Precompile.connect(wallet).renounceOwnership();
```

Run the command below to execute the example script

```shell
pnpm call src/revokeOwnership.ts

```

### `setBaseURI(bytes baseURI)`

- `operator` - Recipient address
- `approved` - boolean (true/false)

```js
const newMetadataPath = "https://example.com/sft/updated/";

const baseURITx = await erc1155Precompile
  .connect(wallet)
  .setBaseURI(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(newMetadataPath)));
```

Run the command below to execute the example script

```shell
pnpm call src/setBaseURI.ts

```

### `setMaxSupply(uint256 id, uint32 maxSupply)`

- `id` - serial number
- `maxSupply` - maximum supply

```js
const tx = await erc1155Precompile
  .connect(wallet)
  .setMaxSupply(serialNumber, maxIssuance);
const receipt = await tx.wait();
```

Run the command below to execute the example script

```shell
pnpm call src/setMaxSupply.ts

```

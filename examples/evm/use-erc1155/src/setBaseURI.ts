import { cleanEnv, str } from "envalid";
import assert from "assert";
import {
  createToken,
  getERC1155Precompile,
} from "@trne/utils/getERC1155PrecompileContract";
import { ethers } from "ethers";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const COLLECTION_ID = null; // If user knows the collection id, can pass collection over erc1155PrecompileAddress
const erc1155PrecompileAddress = "0xbbbbbBbb00000864000000000000000000000000";

export async function main() {
  const { erc1155Precompile, wallet } = getERC1155Precompile(
    env.CALLER_PRIVATE_KEY,
    erc1155PrecompileAddress,
    COLLECTION_ID
  );
  const initialIssuance = 123;
  const serialNumber = await createToken(
    erc1155Precompile,
    initialIssuance,
    wallet
  );
  const tokenUri = await erc1155Precompile.uri(serialNumber);
  assert(
    tokenUri === `https://example.com/sft/metadata${serialNumber}`,
    `Incorrect token uri ${tokenUri}`
  );
  const serialNumberNew = await createToken(
    erc1155Precompile,
    initialIssuance,
    wallet
  );
  const newMetadataPath = "https://example.com/sft/updated/";

  const baseURITx = await erc1155Precompile
    .connect(wallet)
    .setBaseURI(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(newMetadataPath))
    );
  const receipt = await baseURITx.wait();
  const event = (receipt?.events as any)[0].event;
  const baseURI = (receipt?.events as any)[0].args.baseURI;
  assert(event === `BaseURIUpdated`, `Incorrect event ${event}`);
  assert(
    baseURI.toString() === newMetadataPath,
    `Incorrectly set base uri ${baseURI.toString()}`
  );

  const checkURI = await erc1155Precompile.uri(serialNumberNew);
  // Verify URI set correctly
  assert(
    checkURI.toString() ===
      `https://example.com/sft/updated/${serialNumberNew}`,
    `Incorrectly set base uri ${checkURI.toString()}`
  );
}

main();

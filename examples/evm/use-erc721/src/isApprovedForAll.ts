//const precompileGasEstimate = await erc721Precompile
//       .connect(alithSigner)
//       .estimateGas.isApprovedForAll(alithSigner.address, bobSigner.address);

import { cleanEnv, str } from "envalid";
import assert from "assert";
import { getERC721Precompile } from "@trne/utils/getERC721PrecompileContract";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const COLLECTION_ID = null; // If user knows the collection id, can pass collection over erc721PrecompileAddress
const erc721PrecompileAddress = "0xaaAAAAAA0001A864000000000000000000000000";

export async function main() {
  const { erc721Precompile, wallet } = getERC721Precompile(
    env.CALLER_PRIVATE_KEY,
    erc721PrecompileAddress,
    COLLECTION_ID
  );
  const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";

  // Estimate contract call
  const isApproved = await erc721Precompile
    .connect(wallet)
    .isApprovedForAll(wallet.address, bob);

  console.log("approved::", isApproved);
  assert(isApproved === false, `Approved all for bob`);
}

main();

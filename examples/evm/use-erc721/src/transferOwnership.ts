import { cleanEnv, str } from "envalid";
import { getERC721Precompile } from "@trne/utils/getERC721PrecompileContract";
import assert from "assert";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const COLLECTION_ID = 105572;

export async function main() {
  const { erc721Precompile, wallet } = getERC721Precompile(
    env.CALLER_PRIVATE_KEY,
    COLLECTION_ID
  );
  const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";

  const transferOwnershipTx = await erc721Precompile
    .connect(wallet)
    .transferOwnership(bob);
  const receipt = await transferOwnershipTx.wait();

  const { event } = (receipt?.events as any)[0];
  const { previousOwner, newOwner } = (receipt?.events as any)[0].args;
  assert(event === "OwnershipTransferred", `Incorrect event ${event}`);
  assert(
    previousOwner === "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b",
    `Incorrect from field ${previousOwner}`
  );
  assert(newOwner === bob, `Incorrect to field ${newOwner}`);
}

main();

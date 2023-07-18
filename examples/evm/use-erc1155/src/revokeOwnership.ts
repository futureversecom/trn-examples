import { cleanEnv, str } from "envalid";
import assert from "assert";
import { getERC1155Precompile } from "@trne/utils/getERC1155PrecompileContract";

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

  const revokeOwnershipTx = await erc1155Precompile
    .connect(wallet)
    .renounceOwnership();

  const receipt = await revokeOwnershipTx.wait();

  const { event } = (receipt?.events as any)[0];
  console.log("event::", event);
  console.log(
    "(receipt?.events as any)[0].args::",
    (receipt?.events as any)[0].args
  );
  const { previousOwner, newOwner } = (receipt?.events as any)[0].args;
  assert(event === "OwnershipTransferred", `Incorrect event ${event}`);
  assert(
    previousOwner === "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b",
    `Incorrect from field ${previousOwner}`
  );
  assert(
    newOwner === "0x0000000000000000000000000000000000000000",
    `Incorrect to field ${newOwner}`
  );
}

main();

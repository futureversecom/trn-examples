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
  const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";

  const tx = await erc1155Precompile.setApprovalForAll(bob, true);
  const receipt = await tx.wait();

  const { event } = (receipt?.events as any)[0];
  const { account, approved, operator } = (receipt?.events as any)[0].args;
  assert(event === "ApprovalForAll", `Incorrect event ${event}`);
  assert(account === wallet.address, `Incorrect owner ${account}`);
  assert(
    operator === "0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
    `Incorrect operator ${operator}`
  );
  assert(approved === true, `Incorrect approved ${approved}`);
}

main();

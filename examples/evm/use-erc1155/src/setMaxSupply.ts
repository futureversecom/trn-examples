import { cleanEnv, str } from "envalid";
import assert from "assert";
import {
  createToken,
  getERC1155Precompile,
} from "@trne/utils/getERC1155PrecompileContract";

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
  const maxIssuance = 123;
  const tx = await erc1155Precompile
    .connect(wallet)
    .setMaxSupply(serialNumber, maxIssuance);
  const receipt = await tx.wait();

  // validate event
  const event = (receipt?.events as any)[0].event;
  const maxSupply = (receipt?.events as any)[0].args.maxSupply;
  assert(event === `MaxSupplyUpdated`, `Incorrect event ${event}`);
  assert(
    maxSupply.toNumber() === maxIssuance,
    `Incorrectly set base uri ${maxSupply.toString()}`
  );
}

main();

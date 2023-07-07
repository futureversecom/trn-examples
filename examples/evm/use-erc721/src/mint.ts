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
  const quantity = 105;

  const mintTx = await erc721Precompile
    .connect(wallet)
    .mint(wallet.address, quantity);
  const receipt = await mintTx.wait();
  console.log("receipt:", receipt);

  const { event } = (receipt?.events as any)[0];
  const { from, to, tokenId } = (receipt?.events as any)[0].args;
  assert(event === "Transfer", `Incorrect event ${event}`);
  assert(
    from === "0x0000000000000000000000000000000000000000",
    `Incorrect from field ${from}`
  );
  assert(
    to === "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b",
    `Incorrect to field ${to}`
  );
  assert(tokenId.toNumber() >= quantity, `Incorrect to quantity ${tokenId}`);
}

main();

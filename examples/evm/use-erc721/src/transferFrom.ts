import { cleanEnv, str } from "envalid";
import assert from "assert";
import {
  getERC721Precompile,
  getSignerWallet,
} from "@trne/utils/getERC721PrecompileContract";
const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
  BOB_PRIVATE_KEY: str(),
});

const COLLECTION_ID = 105572;
const serialNumber = 43;
export async function main() {
  const { erc721Precompile, wallet } = getERC721Precompile(
    env.CALLER_PRIVATE_KEY,
    COLLECTION_ID
  );
  const bobSigner = getSignerWallet(env.BOB_PRIVATE_KEY);

  const tx = await erc721Precompile
    .connect(wallet)
    .approve(bobSigner.address, serialNumber);
  await tx.wait();
  const txTransferFrom = await erc721Precompile
    .connect(bobSigner)
    .transferFrom(wallet.address, bobSigner.address, serialNumber);
  const receipt = await txTransferFrom.wait();
  const { event } = (receipt?.events as any)[0];
  const { from, to, tokenId } = (receipt?.events as any)[0].args;
  assert(event === "Transfer", `Incorrect event ${event}`);
  assert(from === wallet.address, `Incorrect from field ${from}`);
  assert(to === bobSigner.address, `Incorrect to field ${to}`);
  assert(
    tokenId.toString() === serialNumber.toString(),
    `Incorrect to tokenId ${serialNumber}`
  );
  console.log(`Completed transferFrom at blockhash ${receipt.blockHash}`);
}

main();

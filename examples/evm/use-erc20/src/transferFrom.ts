import { cleanEnv, str } from "envalid";
import { getDefaultProvider, Wallet } from "ethers";
import { getERC20PrecompileForAssetId } from "@trne/utils/getERC20PrecompileAddress";
import assert from "assert";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
  BOB_PRIVATE_KEY: str(),
});

// Find token details at
// https://explorer.rootnet.cloud/tokens
const XRP_TOKEN_ID = 2;

export async function main() {
  const { erc20Precompile, wallet } = getERC20PrecompileForAssetId(
    env.CALLER_PRIVATE_KEY,
    XRP_TOKEN_ID
  );
  const bobSigner = new Wallet(
    env.BOB_PRIVATE_KEY,
    getDefaultProvider("https://porcini.rootnet.app/")
  );
  const amountApproved = 200;

  const tx = await erc20Precompile
    .connect(wallet)
    .approve(bobSigner.address, amountApproved);
  let receipt = await tx.wait();
  console.log("receipt::", receipt);

  const txTransferFrom = await erc20Precompile
    .connect(bobSigner)
    .transferFrom(wallet.address, bobSigner.address, amountApproved);
  receipt = await txTransferFrom.wait();
  console.log("receipt::", receipt);
  const { event } = (receipt?.events as any)[0];
  const { from, to, value } = (receipt?.events as any)[0].args;
  assert(event === "Transfer", `Incorrect event ${event}`);
  assert(from === wallet.address, `Incorrect from field ${from}`);
  assert(to === bobSigner.address, `Incorrect to field ${to}`);
  assert(
    value.toString() === amountApproved.toString(),
    `Incorrect to amount ${value}`
  );
  console.log(`Completed transferFrom at blockhash ${receipt.blockHash}`);
}

main();

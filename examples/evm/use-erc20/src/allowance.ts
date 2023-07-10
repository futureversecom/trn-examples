import { cleanEnv, str } from "envalid";
import { getERC20PrecompileForAssetId } from "@trne/utils/getERC20PrecompileAddress";
import assert from "assert";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

// Find token details at
// https://explorer.rootnet.cloud/tokens
const XRP_TOKEN_ID = 2;

export async function main() {
  const { erc20Precompile, wallet } = getERC20PrecompileForAssetId(
    env.CALLER_PRIVATE_KEY,
    XRP_TOKEN_ID
  );
  const target = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
  const amountToApprove = 400;

  const tx = await erc20Precompile
    .connect(wallet)
    .approve(target, amountToApprove);
  await tx.wait();

  const approvedAmount = await erc20Precompile
    .connect(wallet)
    .allowance(wallet.address, target);
  console.log("approvedAmount::", approvedAmount.toString());
  assert(
    amountToApprove.toString() === approvedAmount.toString(),
    `Incorrect allowance ${approvedAmount.toString()}`
  );
}

main();

import { cleanEnv, str } from "envalid";
import { Contract, getDefaultProvider, Wallet } from "ethers";
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

  const totalSupply = await erc20Precompile.connect(wallet).totalSupply();
  console.log("totalSupply:", totalSupply.toString());
  assert(
    totalSupply.toNumber() > 0,
    `TotalSupply for ${XRP_TOKEN_ID} is less than 0 ${totalSupply.toNumber()}`
  );
}

main();
